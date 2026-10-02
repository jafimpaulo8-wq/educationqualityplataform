import React, { useRef, useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  QrCode, 
  ShieldCheck, 
  FileText, 
  Building2, 
  User, 
  Image as ImageIcon,
  Calendar,
  Lock,
  EyeOff
} from 'lucide-react';
import { StudioElement, DocumentFormat, DocumentSide, DocumentBackground } from '../../types/studio';
import { Student, Institution, Course, ClassGroup } from '../../types';
import { replaceDynamicVariables } from '../../utils/documentVariables';

interface StudioCanvasProps {
  format: DocumentFormat;
  side: DocumentSide;
  background: DocumentBackground;
  elements: StudioElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<StudioElement>) => void;
  isPreviewMode: boolean;
  selectedStudent: Student | null;
  institution: Institution;
  course?: Course | null;
  classGroup?: ClassGroup | null;
  zoom: number; // e.g. 100 for 100%
  onDeleteElement?: (id: string) => void;
  onDuplicateElement?: (id: string) => void;
}

export const StudioCanvas: React.FC<StudioCanvasProps> = ({
  format,
  side,
  background,
  elements,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  isPreviewMode,
  selectedStudent,
  institution,
  course,
  classGroup,
  zoom,
  onDeleteElement,
  onDuplicateElement
}) => {
  const artboardRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ mouseX: number; mouseY: number; elemX: number; elemY: number } | null>(null);

  // Filter elements belonging to the active side
  const visibleElements = elements.filter(el => !el.hidden && (el.side === side || el.side === 'ambos'));

  // Calculate dimensions based on format
  // A4 ratio: 297mm x 210mm (Horizontal: 1.414:1, Vertical: 1:1.414)
  // Carteirinha: 85mm x 54mm (approx 1:1.57)
  let canvasWidth = 840; // px reference width
  let canvasHeight = 594; // A4 Horizontal reference

  if (format === 'A4_Vertical') {
    canvasWidth = 620;
    canvasHeight = 877;
  } else if (format === 'Carteirinha') {
    canvasWidth = 360;
    canvasHeight = 520;
  }

  const scaleFactor = zoom / 100;

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent, element: StudioElement) => {
    if (isPreviewMode || element.locked) return;
    e.stopPropagation();
    onSelectElement(element.id);

    setDraggingId(element.id);
    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      elemX: element.x,
      elemY: element.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !dragStart || !artboardRef.current) return;

    const rect = artboardRef.current.getBoundingClientRect();
    const deltaX = (e.clientX - dragStart.mouseX) / (rect.width / 100);
    const deltaY = (e.clientY - dragStart.mouseY) / (rect.height / 100);

    const newX = Math.max(0, Math.min(95, Math.round(dragStart.elemX + deltaX)));
    const newY = Math.max(0, Math.min(95, Math.round(dragStart.elemY + deltaY)));

    onUpdateElement(draggingId, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setDraggingId(null);
    setDragStart(null);
  };

  const evalText = (text?: string): string => {
    if (!text) return '';
    if (!isPreviewMode) return text;
    return replaceDynamicVariables(text, {
      student: selectedStudent,
      institution,
      course,
      classGroup
    });
  };

  // Render individual element according to its type
  const renderElementContent = (element: StudioElement) => {
    switch (element.type) {
      case 'cabecalho':
        return (
          <div className="text-center space-y-1 w-full h-full flex flex-col justify-center">
            {element.headerRepublicText && (
              <p className="text-[10px] sm:text-[11px] font-sans font-bold tracking-widest uppercase text-slate-600">
                {evalText(element.headerRepublicText)}
              </p>
            )}
            {element.headerMinistryText && (
              <p className="text-[9px] sm:text-[10px] font-sans font-semibold tracking-wider uppercase text-slate-500">
                {evalText(element.headerMinistryText)}
              </p>
            )}
            {element.headerInstitutionText && (
              <h2 className="text-sm sm:text-base font-black tracking-tight uppercase text-slate-900">
                {evalText(element.headerInstitutionText)}
              </h2>
            )}
          </div>
        );

      case 'texto':
        return (
          <div
            className="w-full h-full overflow-hidden"
            style={{
              fontSize: `${element.fontSize || 14}px`,
              fontWeight: element.fontWeight || 'normal',
              fontFamily: element.fontFamily === 'serif' ? 'serif' : element.fontFamily === 'mono' ? 'monospace' : 'sans-serif',
              fontStyle: element.fontStyle || 'normal',
              textAlign: element.textAlign || 'left',
              color: element.color || '#0f172a',
              lineHeight: element.lineHeight || 1.4,
              letterSpacing: element.letterSpacing || 'normal',
              whiteSpace: 'pre-line'
            }}
          >
            {evalText(element.content)}
          </div>
        );

      case 'campo_dinamico':
        return (
          <div
            className="w-full h-full flex items-center justify-center overflow-hidden"
            style={{
              fontSize: `${element.fontSize || 18}px`,
              fontWeight: element.fontWeight || 'bold',
              fontFamily: element.fontFamily === 'serif' ? 'serif' : 'sans-serif',
              textAlign: element.textAlign || 'center',
              color: element.color || '#0f172a'
            }}
          >
            <span className={!isPreviewMode ? 'bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300 font-mono text-xs font-bold' : ''}>
              {isPreviewMode ? evalText(element.variableKey) : (element.variableKey || '{{campo_dinamico}}')}
            </span>
          </div>
        );

      case 'logotipo':
      case 'imagem':
        return (
          <div className="w-full h-full flex items-center justify-center overflow-hidden">
            {element.imageUrl ? (
              <img
                src={element.imageUrl}
                alt={element.name}
                className="w-full h-full object-contain pointer-events-none"
                style={{
                  borderRadius: `${element.borderRadius || 0}px`,
                  opacity: element.opacity !== undefined ? element.opacity : 1
                }}
              />
            ) : (
              <div className="w-full h-full bg-slate-100 border-2 border-dashed border-slate-300 rounded flex flex-col items-center justify-center text-slate-400">
                <ImageIcon className="w-6 h-6 mb-1" />
                <span className="text-[10px]">Logotipo / Imagem</span>
              </div>
            )}
          </div>
        );

      case 'fotografia':
        const photoSrc = isPreviewMode && selectedStudent?.photoUrl ? selectedStudent.photoUrl : (element.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80');
        return (
          <div className="w-full h-full p-1">
            <div
              className="w-full h-full overflow-hidden shadow-xs relative bg-slate-100"
              style={{
                borderRadius: `${element.borderRadius || 8}px`,
                borderWidth: `${element.borderWidth || 2}px`,
                borderColor: element.borderColor || '#b45309',
                borderStyle: 'solid'
              }}
            >
              <img
                src={photoSrc}
                alt="Foto 3x4"
                className="w-full h-full object-cover pointer-events-none"
              />
              <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[8px] text-white text-center font-mono py-0.5">
                3×4 OFICIAL
              </span>
            </div>
          </div>
        );

      case 'forma':
        return (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: element.backgroundColor || '#f8fafc',
              borderColor: element.borderColor || '#cbd5e1',
              borderWidth: `${element.borderWidth !== undefined ? element.borderWidth : 1}px`,
              borderStyle: element.borderStyle || 'solid',
              borderRadius: element.shapeType === 'circulo' ? '9999px' : `${element.borderRadius || 8}px`,
              opacity: element.opacity !== undefined ? element.opacity : 1
            }}
          />
        );

      case 'linha':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div
              className="w-full"
              style={{
                borderBottomStyle: (element.borderStyle as any) || 'solid',
                borderBottomColor: element.borderColor || '#cbd5e1',
                borderBottomWidth: `${element.borderWidth || 2}px`
              }}
            />
          </div>
        );

      case 'tabela':
        const columns = element.tableColumns || ['Item', 'Descrição', 'Nota', 'Situação'];
        const rows = element.tableRows || [
          ['01', 'Módulo Exemplo 1', '18 Valores', 'Aprovado'],
          ['02', 'Módulo Exemplo 2', '17 Valores', 'Aprovado']
        ];
        return (
          <div className="w-full h-full overflow-hidden bg-white border border-slate-300 rounded shadow-xs">
            <table className="w-full h-full text-left text-[10px] border-collapse">
              <thead>
                <tr style={{ backgroundColor: element.tableHeaderBg || '#0f172a', color: element.tableHeaderColor || '#ffffff' }}>
                  {columns.map((col, idx) => (
                    <th key={idx} className="p-1.5 border border-slate-400 font-bold">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-1.5 border border-slate-200 font-medium text-slate-800">
                        {evalText(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'assinatura':
        return (
          <div className="w-full h-full flex flex-col justify-end text-center space-y-1">
            <div className="w-4/5 mx-auto border-b border-slate-800 relative pb-1">
              <span className="font-serif italic text-blue-900 font-bold text-xs sm:text-sm block">
                {element.signerName ? evalText(element.signerName) : 'Assinatura Digital'}
              </span>
              {element.hasStampOnSignature && (
                <div className="absolute -top-3 -right-2 w-8 h-8 rounded-full border border-emerald-600/40 bg-emerald-500/10 flex items-center justify-center text-[7px] text-emerald-800 font-black rotate-12">
                  SELADO
                </div>
              )}
            </div>
            <strong className="text-[10px] text-slate-900 block leading-tight">
              {evalText(element.signerName) || 'Nome do Signatário'}
            </strong>
            <span className="text-[8px] text-slate-500 block leading-tight">
              {element.signerTitle || element.signerRole || 'Cargo'}
            </span>
          </div>
        );

      case 'carimbo':
        const stampBorder = element.stampColor || '#059669';
        return (
          <div className="w-full h-full flex items-center justify-center select-none">
            <div
              className="w-full h-full rounded-full border-2 border-dashed flex flex-col items-center justify-center text-center p-1 font-sans rotate-[-6deg] shadow-xs"
              style={{ borderColor: stampBorder, color: stampBorder }}
            >
              <span className="text-[7px] font-black uppercase tracking-wider block">
                {element.stampTextTop || 'REPÚBLICA DE MOÇAMBIQUE'}
              </span>
              <div
                className="my-0.5 px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase border border-current"
                style={{ backgroundColor: `${stampBorder}15` }}
              >
                {element.stampCenterText || 'HOMOLOGADO'}
              </div>
              <span className="text-[6.5px] font-bold block">
                {element.stampTextBottom || 'SIVEC • MINISTÉRIO DA EDUCAÇÃO'}
              </span>
            </div>
          </div>
        );

      case 'qrcode':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-white p-1 rounded-lg border border-slate-200 shadow-xs">
            <div className="p-1 bg-white rounded border border-slate-300">
              <QrCode className="w-10 h-10 sm:w-12 sm:h-12 text-slate-950" />
            </div>
            {element.showQrHash && (
              <span className="text-[8px] font-mono text-slate-600 mt-1 font-bold">
                {element.qrHashText || 'HASH: e7c90b41aa89'}
              </span>
            )}
            {element.qrCaption && (
              <span className="text-[7.5px] font-sans text-emerald-700 font-semibold">
                ✓ {element.qrCaption}
              </span>
            )}
          </div>
        );

      case 'numero_documento':
        return (
          <div className="w-full h-full flex items-center font-mono text-[10px] sm:text-[11px] text-slate-700">
            <span className="bg-slate-100 border border-slate-300 px-2 py-0.5 rounded font-bold">
              REG: {element.docNumberPrefix || 'DOC-'}{evalText(element.docNumberFormat || '2026/0891-MZ')}
            </span>
          </div>
        );

      case 'data':
        return (
          <div className="w-full h-full flex items-center justify-center text-[10px] sm:text-[11px] font-serif italic text-slate-700">
            {evalText(element.content || `${element.dateCity || 'Maputo'}, {{data_extenso}}`)}
          </div>
        );

      case 'rodape':
        return (
          <div className="w-full h-full flex flex-col justify-center text-center text-[8px] sm:text-[9px] text-slate-500 border-t border-slate-300 pt-1 space-y-0.5">
            <p className="font-sans">
              {evalText(element.footerLegalText || 'Documento oficial homologado pelo Sistema SIVERC. Verificação de autenticidade acessível via QR Code.')}
            </p>
            {element.footerVerificationUrl && (
              <p className="font-mono text-slate-400">
                {element.footerVerificationUrl}
              </p>
            )}
          </div>
        );

      default:
        return (
          <div className="w-full h-full bg-slate-100 text-xs p-2 rounded">
            {element.name}
          </div>
        );
    }
  };

  return (
    <div
      className="w-full overflow-auto flex items-center justify-center p-4 sm:p-8 select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={() => onSelectElement(null)}
    >
      {/* Container Scaled by Zoom */}
      <div
        style={{
          transform: `scale(${scaleFactor})`,
          transformOrigin: 'top center',
          transition: draggingId ? 'none' : 'transform 0.15s ease'
        }}
        className="relative"
      >
        {/* Printable / Viewable Artboard */}
        <div
          ref={artboardRef}
          id="document-studio-canvas"
          className="relative shadow-2xl transition-all overflow-hidden"
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            backgroundColor: background.color || '#ffffff',
            borderWidth: background.borderStyle === 'nenhuma' ? '1px' : `${background.borderWidth || 2}px`,
            borderStyle: background.borderStyle === 'classica_dourada' ? 'double' : background.borderStyle === 'dupla_institucional' ? 'double' : 'solid',
            borderColor: background.borderStyle === 'nenhuma' ? '#e2e8f0' : (background.borderColor || '#cbd5e1')
          }}
        >
          {/* Background Security Watermark */}
          {background.watermarkText && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
              style={{ opacity: background.watermarkOpacity || 0.04 }}
            >
              <span className="text-4xl sm:text-6xl font-black uppercase text-slate-900 rotate-[-25deg] tracking-widest text-center">
                {background.watermarkText}
              </span>
            </div>
          )}

          {/* Ornamental Gold Baroque Corners */}
          {background.cornerOrnaments && (
            <>
              <div className="absolute top-2 left-2 w-7 h-7 border-t-2 border-l-2 pointer-events-none z-1" style={{ borderColor: background.borderColor || '#b45309' }} />
              <div className="absolute top-2 right-2 w-7 h-7 border-t-2 border-r-2 pointer-events-none z-1" style={{ borderColor: background.borderColor || '#b45309' }} />
              <div className="absolute bottom-2 left-2 w-7 h-7 border-b-2 border-l-2 pointer-events-none z-1" style={{ borderColor: background.borderColor || '#b45309' }} />
              <div className="absolute bottom-2 right-2 w-7 h-7 border-b-2 border-r-2 pointer-events-none z-1" style={{ borderColor: background.borderColor || '#b45309' }} />
            </>
          )}

          {/* Safety Margins Guide (Design Mode Only) */}
          {!isPreviewMode && (
            <div className="absolute inset-4 border border-dashed border-sky-400/30 pointer-events-none z-1 rounded-sm" />
          )}

          {/* Render Elements */}
          {visibleElements.map((element, idx) => {
            const isSelected = selectedElementId === element.id;
            const elementKey = element.id || `canvas-elem-${idx}-${element.type}`;

            return (
              <div
                key={elementKey}
                id={`studio-elem-${elementKey}`}
                onMouseDown={(e) => handleMouseDown(e, element)}
                className={`absolute cursor-pointer select-none transition-shadow ${
                  isSelected && !isPreviewMode
                    ? 'ring-2 ring-sky-500 ring-offset-1 z-50 shadow-md'
                    : 'hover:outline-1 hover:outline-dashed hover:outline-sky-400/60'
                } ${element.locked ? 'cursor-not-allowed opacity-90' : ''}`}
                style={{
                  left: `${element.x}%`,
                  top: `${element.y}%`,
                  width: `${element.width}%`,
                  height: `${element.height}%`,
                  zIndex: isSelected ? 50 : element.zIndex
                }}
              >
                {/* Visual Resize / Action Handles (When Selected in Design Mode) */}
                {isSelected && !isPreviewMode && (
                  <>
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-sky-500 border border-white rounded-full z-50" />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-sky-500 border border-white rounded-full z-50" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-sky-500 border border-white rounded-full z-50" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-sky-500 border border-white rounded-full z-50" />

                    {/* Quick Mini Toolbar */}
                    <div className="absolute -top-8 left-0 flex items-center gap-1 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow-lg border border-slate-700 z-50 whitespace-nowrap">
                      <span>{element.name}</span>
                      {element.locked && <Lock className="w-3 h-3 text-amber-400" />}
                    </div>
                  </>
                )}

                {/* The Content */}
                {renderElementContent(element)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
