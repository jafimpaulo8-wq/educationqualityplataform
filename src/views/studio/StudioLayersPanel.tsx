import React from 'react';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  Type,
  Square,
  Minus,
  Table,
  PenTool,
  Stamp,
  QrCode,
  Image as ImageIcon,
  Calendar,
  Hash
} from 'lucide-react';
import { StudioElement, DocumentSide, ElementType } from '../../types/studio';

interface StudioLayersPanelProps {
  elements: StudioElement[];
  currentSide: DocumentSide;
  selectedElementId: string | null;
  onSelectElement: (id: string) => void;
  onUpdateElement: (id: string, updates: Partial<StudioElement>) => void;
  onDeleteElement: (id: string) => void;
  onReorderElements: (reordered: StudioElement[]) => void;
}

export const StudioLayersPanel: React.FC<StudioLayersPanelProps> = ({
  elements,
  currentSide,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onReorderElements
}) => {
  const sideElements = elements.filter(el => el.side === currentSide || el.side === 'ambos');

  const moveLayer = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sideElements.length) return;

    const newSideElements = [...sideElements];
    const temp = newSideElements[index];
    newSideElements[index] = newSideElements[targetIndex];
    newSideElements[targetIndex] = temp;

    // Recalculate zIndex
    const updated = newSideElements.map((el, idx) => ({
      ...el,
      zIndex: (idx + 1) * 2
    }));

    // Merge back into full elements array
    const otherSideElements = elements.filter(el => el.side !== currentSide && el.side !== 'ambos');
    onReorderElements([...updated, ...otherSideElements]);
  };

  const getElementIcon = (type: ElementType) => {
    switch (type) {
      case 'texto':
      case 'cabecalho':
      case 'rodape':
        return <Type className="w-3.5 h-3.5 text-sky-600" />;
      case 'campo_dinamico':
        return <span className="text-[9px] font-mono text-amber-600 font-black px-1">{'{}'}</span>;
      case 'fotografia':
      case 'imagem':
      case 'logotipo':
        return <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />;
      case 'assinatura':
        return <PenTool className="w-3.5 h-3.5 text-purple-600" />;
      case 'carimbo':
        return <Stamp className="w-3.5 h-3.5 text-emerald-600" />;
      case 'qrcode':
        return <QrCode className="w-3.5 h-3.5 text-indigo-600" />;
      case 'tabela':
        return <Table className="w-3.5 h-3.5 text-amber-600" />;
      case 'forma':
        return <Square className="w-3.5 h-3.5 text-teal-600" />;
      case 'linha':
        return <Minus className="w-3.5 h-3.5 text-slate-600" />;
      case 'numero_documento':
        return <Hash className="w-3.5 h-3.5 text-slate-600" />;
      case 'data':
        return <Calendar className="w-3.5 h-3.5 text-slate-600" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white border-t border-slate-200 p-2.5 flex items-center justify-between text-xs overflow-x-auto shadow-xs">
      <div className="flex items-center gap-2 pr-4 border-r border-slate-200">
        <Layers className="w-4 h-4 text-slate-500" />
        <span className="font-bold text-slate-700 whitespace-nowrap">
          Camadas ({sideElements.length}):
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-1 px-3 overflow-x-auto">
        {sideElements.map((el, idx) => {
          const isSelected = selectedElementId === el.id;
          return (
            <div
              key={el.id}
              onClick={() => onSelectElement(el.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-sky-50 border-sky-400 text-sky-900 font-bold ring-1 ring-sky-300'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {getElementIcon(el.type)}
              <span className="max-w-[110px] truncate">{el.name}</span>

              {/* Layer Controls */}
              <div className="flex items-center gap-0.5 ml-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => moveLayer(idx, 'up')}
                  disabled={idx === 0}
                  className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                  title="Elevar Camada"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => moveLayer(idx, 'down')}
                  disabled={idx === sideElements.length - 1}
                  className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                  title="Abaixar Camada"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onUpdateElement(el.id, { locked: !el.locked })}
                  className="p-0.5 text-slate-400 hover:text-amber-600"
                  title={el.locked ? 'Desbloquear' : 'Bloquear'}
                >
                  {el.locked ? <Lock className="w-3 h-3 text-amber-500" /> : <Unlock className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => onUpdateElement(el.id, { hidden: !el.hidden })}
                  className="p-0.5 text-slate-400 hover:text-sky-600"
                  title={el.hidden ? 'Exibir' : 'Ocultar'}
                >
                  {el.hidden ? <EyeOff className="w-3 h-3 text-red-500" /> : <Eye className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => onDeleteElement(el.id)}
                  className="p-0.5 text-slate-400 hover:text-red-600 ml-0.5"
                  title="Excluir Camada"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
