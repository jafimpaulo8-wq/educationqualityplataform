import React from 'react';
import { 
  Sliders, 
  Trash2, 
  Copy, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  ArrowUp,
  ArrowDown,
  Palette,
  Sparkles,
  Shield,
  Frame
} from 'lucide-react';
import { StudioElement, DocumentFormat, DocumentBackground, DocumentSide } from '../../types/studio';
import { DYNAMIC_VARIABLES_LIST } from '../../utils/documentVariables';

interface StudioInspectorProps {
  selectedElement: StudioElement | null;
  onUpdateElement: (id: string, updates: Partial<StudioElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  currentSide: DocumentSide;
  background: DocumentBackground;
  onUpdateBackground: (updates: Partial<DocumentBackground>) => void;
  format: DocumentFormat;
  onChangeFormat: (format: DocumentFormat) => void;
}

export const StudioInspector: React.FC<StudioInspectorProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  currentSide,
  background,
  onUpdateBackground,
  format,
  onChangeFormat
}) => {
  // If no element is selected, show Canvas & Background properties
  if (!selectedElement) {
    return (
      <aside className="w-80 bg-white border-l border-slate-200 flex flex-col h-full overflow-y-auto p-4 space-y-5 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
          <Frame className="w-4 h-4 text-sky-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Propriedades da Página ({currentSide === 'frente' ? 'Frente' : 'Verso'})
          </h3>
        </div>

        {/* Formato do Documento */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Formato da Folha</label>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => onChangeFormat('A4_Vertical')}
              className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition-colors ${
                format === 'A4_Vertical' ? 'bg-sky-50 border-sky-500 text-sky-800 ring-1 ring-sky-500' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              A4 Vertical
            </button>
            <button
              onClick={() => onChangeFormat('A4_Horizontal')}
              className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition-colors ${
                format === 'A4_Horizontal' ? 'bg-sky-50 border-sky-500 text-sky-800 ring-1 ring-sky-500' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              A4 Horizontal
            </button>
            <button
              onClick={() => onChangeFormat('Carteirinha')}
              className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition-colors ${
                format === 'Carteirinha' ? 'bg-sky-50 border-sky-500 text-sky-800 ring-1 ring-sky-500' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Carteirinha
            </button>
          </div>
        </div>

        {/* Fundo do Documento */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-slate-500" />
            Cor & Textura de Fundo
          </label>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={background.color}
                onChange={(e) => onUpdateBackground({ color: e.target.value })}
                className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0"
              />
              <span className="text-xs font-mono text-slate-600 uppercase">{background.color}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-500">Padrão Gráfico / Textura</span>
              <select
                value={background.pattern}
                onChange={(e) => onUpdateBackground({ pattern: e.target.value as any })}
                className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2 bg-white text-slate-800"
              >
                <option value="none">Nenhum (Liso)</option>
                <option value="guilloche">Guilloche de Segurança (Certificado)</option>
                <option value="pergaminho">Pergaminho Histórico</option>
                <option value="linhas_finas">Linhas Geométricas Finas</option>
                <option value="gradiente">Gradiente Moderno</option>
              </select>
            </div>
          </div>
        </div>

        {/* Marca d'Água de Segurança */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            Marca d'Água Central
          </label>
          <input
            type="text"
            value={background.watermarkText || ''}
            onChange={(e) => onUpdateBackground({ watermarkText: e.target.value })}
            placeholder="Ex: REPÚBLICA DE MOÇAMBIQUE"
            className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-800"
          />
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Opacidade:</span>
            <input
              type="range"
              min="0"
              max="0.2"
              step="0.01"
              value={background.watermarkOpacity || 0.05}
              onChange={(e) => onUpdateBackground({ watermarkOpacity: parseFloat(e.target.value) })}
              className="w-full accent-sky-600"
            />
          </div>
        </div>

        {/* Moldura & Bordas Oficiais */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Moldura & Borda Oficial
          </label>

          <div className="space-y-1">
            <span className="text-[11px] text-slate-500">Estilo de Borda</span>
            <select
              value={background.borderStyle}
              onChange={(e) => onUpdateBackground({ borderStyle: e.target.value as any })}
              className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2 bg-white text-slate-800"
            >
              <option value="nenhuma">Sem Moldura</option>
              <option value="classica_dourada">Clássica Dourada (Certificados de Honra)</option>
              <option value="dupla_institucional">Dupla Linha Institucional</option>
              <option value="moderna_fina">Moderna Fina Minimalista</option>
            </select>
          </div>

          {background.borderStyle !== 'nenhuma' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Cor da Borda</span>
                <input
                  type="color"
                  value={background.borderColor}
                  onChange={(e) => onUpdateBackground({ borderColor: e.target.value })}
                  className="w-full h-8 rounded border border-slate-300 cursor-pointer p-0"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Espessura (px)</span>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={background.borderWidth}
                  onChange={(e) => onUpdateBackground({ borderWidth: parseInt(e.target.value) || 1 })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-800"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="chk-ornaments"
              checked={background.cornerOrnaments || false}
              onChange={(e) => onUpdateBackground({ cornerOrnaments: e.target.checked })}
              className="rounded text-sky-600 focus:ring-sky-500 h-4 w-4"
            />
            <label htmlFor="chk-ornaments" className="text-xs text-slate-700 font-medium cursor-pointer">
              Ornamentos de Canto Dourados
            </label>
          </div>
        </div>
      </aside>
    );
  }

  // When an element is selected
  return (
    <aside className="w-80 bg-white border-l border-slate-200 flex flex-col h-full overflow-y-auto p-4 space-y-4 shadow-xs">
      {/* Element Header with Quick Action Icons */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <span className="text-[10px] uppercase font-bold text-sky-600 block">
            {selectedElement.type.replace('_', ' ')}
          </span>
          <h3 className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
            {selectedElement.name}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onUpdateElement(selectedElement.id, { locked: !selectedElement.locked })}
            title={selectedElement.locked ? 'Desbloquear elemento' : 'Bloquear posição'}
            className={`p-1.5 rounded-lg border transition-colors ${
              selectedElement.locked ? 'bg-amber-50 border-amber-300 text-amber-700' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {selectedElement.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onDuplicateElement(selectedElement.id)}
            title="Duplicar elemento"
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteElement(selectedElement.id)}
            title="Excluir elemento"
            className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Geometria: X, Y, W, H */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700">Posição & Dimensões (%)</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-500">X (Esquerda %)</span>
            <input
              type="number"
              min="0"
              max="100"
              value={selectedElement.x}
              onChange={(e) => onUpdateElement(selectedElement.id, { x: parseInt(e.target.value) || 0 })}
              className="w-full text-xs border border-slate-300 rounded-lg p-1.5 bg-white text-slate-800"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500">Y (Topo %)</span>
            <input
              type="number"
              min="0"
              max="100"
              value={selectedElement.y}
              onChange={(e) => onUpdateElement(selectedElement.id, { y: parseInt(e.target.value) || 0 })}
              className="w-full text-xs border border-slate-300 rounded-lg p-1.5 bg-white text-slate-800"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500">Largura (%)</span>
            <input
              type="number"
              min="2"
              max="100"
              value={selectedElement.width}
              onChange={(e) => onUpdateElement(selectedElement.id, { width: parseInt(e.target.value) || 10 })}
              className="w-full text-xs border border-slate-300 rounded-lg p-1.5 bg-white text-slate-800"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500">Altura (%)</span>
            <input
              type="number"
              min="1"
              max="100"
              value={selectedElement.height}
              onChange={(e) => onUpdateElement(selectedElement.id, { height: parseInt(e.target.value) || 5 })}
              className="w-full text-xs border border-slate-300 rounded-lg p-1.5 bg-white text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Tipografia (Para texto, campo_dinamico, cabecalho, rodape) */}
      {(selectedElement.type === 'texto' || selectedElement.type === 'campo_dinamico') && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700">Tipografia</label>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-500">Fonte</span>
              <select
                value={selectedElement.fontFamily || 'serif'}
                onChange={(e) => onUpdateElement(selectedElement.id, { fontFamily: e.target.value as any })}
                className="w-full text-xs border border-slate-300 rounded-lg p-1.5 bg-white text-slate-800"
              >
                <option value="serif">Serif (Clássica)</option>
                <option value="sans">Sans-serif (Moderna)</option>
                <option value="mono">Mono (Código)</option>
              </select>
            </div>
            <div>
              <span className="text-[10px] text-slate-500">Tamanho (px)</span>
              <input
                type="number"
                min="8"
                max="60"
                value={selectedElement.fontSize || 14}
                onChange={(e) => onUpdateElement(selectedElement.id, { fontSize: parseInt(e.target.value) || 14 })}
                className="w-full text-xs border border-slate-300 rounded-lg p-1.5 bg-white text-slate-800"
              >
              </input>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-500">Peso</span>
              <select
                value={selectedElement.fontWeight || 'normal'}
                onChange={(e) => onUpdateElement(selectedElement.id, { fontWeight: e.target.value as any })}
                className="w-full text-xs border border-slate-300 rounded-lg p-1.5 bg-white text-slate-800"
              >
                <option value="normal">Normal</option>
                <option value="medium">Médio</option>
                <option value="semibold">Semibold</option>
                <option value="bold">Negrito</option>
                <option value="black">Black</option>
              </select>
            </div>
            <div>
              <span className="text-[10px] text-slate-500">Cor do Texto</span>
              <input
                type="color"
                value={selectedElement.color || '#0f172a'}
                onChange={(e) => onUpdateElement(selectedElement.id, { color: e.target.value })}
                className="w-full h-8 rounded border border-slate-300 cursor-pointer p-0"
              />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500">Alinhamento</span>
            <div className="flex rounded-lg border border-slate-300 overflow-hidden">
              {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => onUpdateElement(selectedElement.id, { textAlign: align })}
                  className={`flex-1 py-1.5 flex items-center justify-center transition-colors ${
                    selectedElement.textAlign === align ? 'bg-sky-50 text-sky-600 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                  {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                  {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                  {align === 'justify' && <AlignJustify className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo de Texto */}
      {selectedElement.type === 'texto' && (
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700">Conteúdo do Texto</label>
          <textarea
            rows={5}
            value={selectedElement.content || ''}
            onChange={(e) => onUpdateElement(selectedElement.id, { content: e.target.value })}
            className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
          />
        </div>
      )}

      {/* Seletor de Variável Dinâmica */}
      {selectedElement.type === 'campo_dinamico' && (
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700">Variável Associada</label>
          <select
            value={selectedElement.variableKey || '{{nome_aluno}}'}
            onChange={(e) => onUpdateElement(selectedElement.id, { variableKey: e.target.value })}
            className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-800"
          >
            {DYNAMIC_VARIABLES_LIST.map((item) => (
              <option key={item.key} value={item.key}>
                {item.key} — {item.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Configurações de Assinatura */}
      {selectedElement.type === 'assinatura' && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700">Configuração da Assinatura</label>
          <div>
            <span className="text-[10px] text-slate-500">Cargo / Função</span>
            <input
              type="text"
              value={selectedElement.signerRole || ''}
              onChange={(e) => onUpdateElement(selectedElement.id, { signerRole: e.target.value as any })}
              className="w-full text-xs border border-slate-300 rounded-lg p-1.5 bg-white text-slate-800"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500">Nome do Signatário</span>
            <input
              type="text"
              value={selectedElement.signerName || ''}
              onChange={(e) => onUpdateElement(selectedElement.id, { signerName: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-1.5 bg-white text-slate-800"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500">Título Formal na Linha</span>
            <input
              type="text"
              value={selectedElement.signerTitle || ''}
              onChange={(e) => onUpdateElement(selectedElement.id, { signerTitle: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-1.5 bg-white text-slate-800"
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="chk-stamp-sig"
              checked={selectedElement.hasStampOnSignature || false}
              onChange={(e) => onUpdateElement(selectedElement.id, { hasStampOnSignature: e.target.checked })}
              className="rounded text-sky-600 focus:ring-sky-500 h-4 w-4"
            />
            <label htmlFor="chk-stamp-sig" className="text-xs text-slate-700 font-medium cursor-pointer">
              Selo / Carimbo de Autenticação sobreposto
            </label>
          </div>
        </div>
      )}

      {/* Configurações de Carimbo */}
      {selectedElement.type === 'carimbo' && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700">Configuração do Carimbo</label>
          <div>
            <span className="text-[10px] text-slate-500">Texto Superior (Arco)</span>
            <input
              type="text"
              value={selectedElement.stampTextTop || ''}
              onChange={(e) => onUpdateElement(selectedElement.id, { stampTextTop: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-1.5 bg-white text-slate-800"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500">Texto Central (Chancela)</span>
            <input
              type="text"
              value={selectedElement.stampCenterText || ''}
              onChange={(e) => onUpdateElement(selectedElement.id, { stampCenterText: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-1.5 bg-white text-slate-800"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500">Texto Inferior</span>
            <input
              type="text"
              value={selectedElement.stampTextBottom || ''}
              onChange={(e) => onUpdateElement(selectedElement.id, { stampTextBottom: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-1.5 bg-white text-slate-800"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500">Cor do Carimbo</span>
            <input
              type="color"
              value={selectedElement.stampColor || '#059669'}
              onChange={(e) => onUpdateElement(selectedElement.id, { stampColor: e.target.value })}
              className="w-full h-8 rounded border border-slate-300 cursor-pointer p-0"
            />
          </div>
        </div>
      )}

      {/* Imagem / Logotipo / Fotografia */}
      {(selectedElement.type === 'imagem' || selectedElement.type === 'logotipo' || selectedElement.type === 'fotografia') && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700">URL da Imagem</label>
          <input
            type="text"
            value={selectedElement.imageUrl || ''}
            onChange={(e) => onUpdateElement(selectedElement.id, { imageUrl: e.target.value })}
            placeholder="https://..."
            className="w-full text-xs border border-slate-300 rounded-lg p-1.5 bg-white text-slate-800"
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-500">Raio do Canto (px)</span>
              <input
                type="number"
                min="0"
                max="40"
                value={selectedElement.borderRadius || 0}
                onChange={(e) => onUpdateElement(selectedElement.id, { borderRadius: parseInt(e.target.value) || 0 })}
                className="w-full text-xs border border-slate-300 rounded-lg p-1.5 bg-white text-slate-800"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500">Borda (px)</span>
              <input
                type="number"
                min="0"
                max="10"
                value={selectedElement.borderWidth || 0}
                onChange={(e) => onUpdateElement(selectedElement.id, { borderWidth: parseInt(e.target.value) || 0 })}
                className="w-full text-xs border border-slate-300 rounded-lg p-1.5 bg-white text-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* QR Code */}
      {selectedElement.type === 'qrcode' && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700">Parâmetros do QR Code</label>
          <div>
            <span className="text-[10px] text-slate-500">URL de Validação</span>
            <input
              type="text"
              value={selectedElement.qrCodeUrl || ''}
              onChange={(e) => onUpdateElement(selectedElement.id, { qrCodeUrl: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-1.5 bg-white text-slate-800"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500">Código Hash de Validação</span>
            <input
              type="text"
              value={selectedElement.qrHashText || ''}
              onChange={(e) => onUpdateElement(selectedElement.id, { qrHashText: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-1.5 bg-white text-slate-800"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="chk-qr-hash"
              checked={selectedElement.showQrHash || false}
              onChange={(e) => onUpdateElement(selectedElement.id, { showQrHash: e.target.checked })}
              className="rounded text-sky-600 focus:ring-sky-500 h-4 w-4"
            />
            <label htmlFor="chk-qr-hash" className="text-xs text-slate-700 font-medium cursor-pointer">
              Exibir texto do HASH sob o QR
            </label>
          </div>
        </div>
      )}
    </aside>
  );
};
