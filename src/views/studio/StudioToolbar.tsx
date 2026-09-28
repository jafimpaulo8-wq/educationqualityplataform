import React from 'react';
import { 
  ArrowLeft, 
  Save, 
  Copy, 
  History, 
  Printer, 
  ZoomIn, 
  ZoomOut, 
  Eye, 
  Edit3, 
  CheckCircle, 
  XCircle,
  Sparkles,
  Layers,
  UserCheck
} from 'lucide-react';
import { StudioTemplate, DocumentSide } from '../../types/studio';
import { Student } from '../../types';

interface StudioToolbarProps {
  template: StudioTemplate;
  onBackToGallery: () => void;
  currentSide: DocumentSide;
  onSwitchSide: (side: DocumentSide) => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  isPreviewMode: boolean;
  onTogglePreviewMode: () => void;
  students: Student[];
  selectedStudent: Student | null;
  onSelectStudent: (student: Student) => void;
  onSaveTemplate: () => void;
  onOpenVersionHistory: () => void;
  onDuplicateTemplate: () => void;
  onToggleActive: () => void;
  onPrint: () => void;
}

export const StudioToolbar: React.FC<StudioToolbarProps> = ({
  template,
  onBackToGallery,
  currentSide,
  onSwitchSide,
  zoom,
  onZoomChange,
  isPreviewMode,
  onTogglePreviewMode,
  students,
  selectedStudent,
  onSelectStudent,
  onSaveTemplate,
  onOpenVersionHistory,
  onDuplicateTemplate,
  onToggleActive,
  onPrint
}) => {
  return (
    <header className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-xs select-none">
      {/* Left: Back button & Template info */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBackToGallery}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-semibold"
          title="Voltar para Catálogo de Modelos"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Modelos</span>
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black text-slate-900 truncate max-w-[200px] sm:max-w-xs">
              {template.name}
            </h1>
            <span className="text-[10px] uppercase font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
              {template.category.replace('_', ' ')}
            </span>
            <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
              {template.version}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Formato: <strong className="text-slate-700">{template.format.replace('_', ' ')}</strong>
          </span>
        </div>
      </div>

      {/* Center: Side Selector & Preview Mode */}
      <div className="flex items-center gap-2">
        {/* Switch Side (Frente / Verso) */}
        <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          <button
            onClick={() => onSwitchSide('frente')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
              currentSide === 'frente' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Frente
          </button>
          {template.hasBackSide && (
            <button
              onClick={() => onSwitchSide('verso')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                currentSide === 'verso' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Verso
            </button>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="hidden md:flex items-center gap-1 border-l border-r border-slate-200 px-2">
          <button
            onClick={() => onZoomChange(Math.max(50, zoom - 10))}
            className="p-1 text-slate-500 hover:text-slate-800 rounded"
            title="Diminuir Zoom"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono font-bold text-slate-700 w-10 text-center">
            {zoom}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(150, zoom + 10))}
            className="p-1 text-slate-500 hover:text-slate-800 rounded"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onZoomChange(100)}
            className="text-[10px] font-bold text-sky-600 hover:text-sky-800 px-1 py-0.5 rounded hover:bg-sky-50"
          >
            100%
          </button>
        </div>

        {/* Preview with Student Mode */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onTogglePreviewMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              isPreviewMode
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {isPreviewMode ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span>{isPreviewMode ? 'Prévia com Dados' : 'Modo Design'}</span>
          </button>

          {/* Student Selector when in preview mode */}
          {isPreviewMode && students.length > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
              <UserCheck className="w-3.5 h-3.5 text-amber-700" />
              <select
                value={selectedStudent?.id || ''}
                onChange={(e) => {
                  const s = students.find(item => item.id === e.target.value);
                  if (s) onSelectStudent(s);
                }}
                className="text-xs font-semibold bg-transparent text-amber-900 focus:outline-hidden"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.fullName} ({st.courseName || 'Geral'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Version History */}
        <button
          onClick={onOpenVersionHistory}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          title="Histórico de Versões do Modelo"
        >
          <History className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden xl:inline">Versões</span>
        </button>

        {/* Duplicate */}
        <button
          onClick={onDuplicateTemplate}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          title="Duplicar Modelo"
        >
          <Copy className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden xl:inline">Duplicar</span>
        </button>

        {/* Toggle Active/Inactive */}
        <button
          onClick={onToggleActive}
          className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
            template.isActive
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}
          title={template.isActive ? 'Modelo Ativo (visível para emissão)' : 'Modelo Desativado'}
        >
          {template.isActive ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
          <span className="hidden xl:inline">{template.isActive ? 'Ativo' : 'Inativo'}</span>
        </button>

        {/* Print / Export PDF */}
        <button
          onClick={onPrint}
          className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-300 text-slate-800 hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-xs font-bold"
          title="Imprimir Documento Oficial"
        >
          <Printer className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden sm:inline">Imprimir</span>
        </button>

        {/* Save */}
        <button
          onClick={onSaveTemplate}
          className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Salvar</span>
        </button>
      </div>
    </header>
  );
};
