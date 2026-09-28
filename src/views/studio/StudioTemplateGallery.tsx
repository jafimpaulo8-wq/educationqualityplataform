import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Copy, 
  Edit3, 
  History, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Award, 
  Layers, 
  Building2, 
  ShieldCheck,
  CreditCard,
  Table,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { StudioTemplate, DocumentCategory } from '../../types/studio';
import { Institution } from '../../types';

interface StudioTemplateGalleryProps {
  templates: StudioTemplate[];
  activeInstitution: Institution;
  onSelectTemplate: (template: StudioTemplate) => void;
  onNewTemplate: () => void;
  onDuplicateTemplate: (templateId: string) => void;
  onToggleActiveTemplate: (templateId: string) => void;
  onOpenVersionHistory: (template: StudioTemplate) => void;
  onDeleteTemplate?: (templateId: string) => void;
}

const CATEGORY_TABS: { id: 'todas' | DocumentCategory; label: string }[] = [
  { id: 'todas', label: 'Todos os Modelos' },
  { id: 'contrato', label: 'Contratos de Formação' },
  { id: 'termo_compromisso', label: 'Termos de Compromisso' },
  { id: 'termo_responsabilidade', label: 'Termos de Responsab.' },
  { id: 'declaracao', label: 'Declarações' },
  { id: 'declaracao_conclusao', label: 'Declarações de Conclusão' },
  { id: 'declaracao_estagio', label: 'Declarações de Estágio' },
  { id: 'requerimento', label: 'Requerimentos' },
  { id: 'recibo', label: 'Recibos' },
  { id: 'comprovativo', label: 'Comprovativos' },
  { id: 'ficha_matricula', label: 'Fichas de Matrícula' },
  { id: 'ficha_inscricao', label: 'Fichas de Inscrição' },
  { id: 'carteirinha', label: 'Cartões de Estudante' },
  { id: 'cartao_operador', label: 'Cartões de Operador' },
  { id: 'certificado', label: 'Certificados' },
  { id: 'carta_operador', label: 'Cartas de Operador' },
  { id: 'personalizado', label: 'Personalizados' }
];

export const StudioTemplateGallery: React.FC<StudioTemplateGalleryProps> = ({
  templates,
  activeInstitution,
  onSelectTemplate,
  onNewTemplate,
  onDuplicateTemplate,
  onToggleActiveTemplate,
  onOpenVersionHistory,
  onDeleteTemplate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'todas' | DocumentCategory>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativos' | 'inativos'>('todos');

  // Filter templates
  const filteredTemplates = templates.filter((tpl) => {
    // Category filter
    if (selectedCategory !== 'todas' && tpl.category !== selectedCategory) {
      return false;
    }
    // Status filter
    if (statusFilter === 'ativos' && !tpl.isActive) return false;
    if (statusFilter === 'inativos' && tpl.isActive) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = tpl.name.toLowerCase().includes(q);
      const matchDesc = tpl.description?.toLowerCase().includes(q);
      const matchCat = tpl.category.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }

    return true;
  });

  const activeCount = templates.filter(t => t.isActive).length;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200 p-4 sm:p-6 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Document Studio & Modelos Oficiais
              </h1>
              <span className="text-xs font-bold bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full border border-sky-200">
                Editor Gráfico Profissional
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Gerencie, versione e crie modelos gráficos para <strong className="text-slate-700">{activeInstitution.name}</strong> com suporte a certificados, contratos, carimbos e assinaturas.
            </p>
          </div>

          <button
            onClick={onNewTemplate}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs hover:shadow-md transition-all shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Novo Modelo</span>
          </button>
        </div>

        {/* Metrics Summary Strip */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total de Modelos</span>
            <strong className="text-lg font-black text-slate-900">{templates.length}</strong>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Modelos Ativos</span>
            <strong className="text-lg font-black text-emerald-900">{activeCount}</strong>
          </div>
          <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200">
            <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">Formatos A4 / Card</span>
            <strong className="text-lg font-black text-sky-900">Vertical, Horiz. & PVC</strong>
          </div>
          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200">
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">Sistema de Versionamento</span>
            <strong className="text-lg font-black text-purple-900">100% Preservado</strong>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-5">
        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar por modelo, código ou tipo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
              {(['todos', 'ativos', 'inativos'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 text-xs font-bold rounded-md capitalize transition-colors ${
                    statusFilter === st ? 'bg-sky-50 text-sky-700 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Tabs Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="p-12 text-center bg-white border border-dashed border-slate-300 rounded-2xl space-y-3">
            <FileText className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">Nenhum modelo encontrado</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Não encontramos nenhum modelo com os filtros aplicados. Crie um novo modelo personalizado ou ajuste os filtros.
            </p>
            <button
              onClick={onNewTemplate}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl"
            >
              Criar Primeiro Modelo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTemplates.map((template) => {
              const elementsCount = (template.frenteElements?.length || 0) + (template.versoElements?.length || 0);

              return (
                <div
                  key={template.id}
                  className={`bg-white border rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                    template.isActive ? 'border-slate-200' : 'border-slate-200 opacity-80 bg-slate-50/50'
                  }`}
                >
                  {/* Card Thumbnail / Miniature Visual Header */}
                  <div 
                    onClick={() => onSelectTemplate(template)}
                    className="h-36 bg-linear-to-br from-slate-100 to-slate-200 border-b border-slate-200 p-4 relative cursor-pointer group flex flex-col justify-between overflow-hidden"
                  >
                    {/* Visual paper miniature preview effect */}
                    <div className="absolute inset-4 bg-white rounded-lg shadow-sm border border-slate-200/80 p-2.5 flex flex-col justify-between group-hover:scale-[1.02] transition-transform">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <div className="w-16 h-1.5 bg-slate-300 rounded-full" />
                        <div className="w-6 h-1.5 bg-amber-400 rounded-full" />
                      </div>
                      <div className="space-y-1 my-auto text-center">
                        <div className="w-3/4 h-2 bg-slate-800 mx-auto rounded-full" />
                        <div className="w-1/2 h-1 bg-slate-400 mx-auto rounded-full" />
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <div className="w-8 h-1 bg-slate-300 rounded-full" />
                        <div className="w-8 h-1 bg-emerald-500 rounded-full" />
                      </div>
                    </div>

                    {/* Top overlay badges */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-white/95 text-slate-800 px-2 py-0.5 rounded-md shadow-2xs border border-slate-200">
                        {template.format.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-slate-900/80 text-white px-2 py-0.5 rounded-md">
                        {template.version}
                      </span>
                    </div>

                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-[10px] font-bold bg-sky-100/90 text-sky-800 px-2 py-0.5 rounded-md border border-sky-200">
                        {template.category.replace('_', ' ')}
                      </span>
                      {template.hasBackSide && (
                        <span className="text-[10px] font-bold bg-purple-100/90 text-purple-800 px-2 py-0.5 rounded-md border border-purple-200">
                          Frente & Verso
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 
                          onClick={() => onSelectTemplate(template)}
                          className="text-sm font-bold text-slate-900 hover:text-sky-600 transition-colors cursor-pointer line-clamp-1"
                        >
                          {template.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {template.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{elementsCount} elementos</span>
                      <span>Atualizado em {template.updatedAt || template.createdAt}</span>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                    {/* Active toggle button */}
                    <button
                      onClick={() => onToggleActiveTemplate(template.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        template.isActive
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                      title={template.isActive ? 'Clique para Desativar este modelo' : 'Clique para Ativar este modelo'}
                    >
                      {template.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{template.isActive ? 'Ativo' : 'Inativo'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {/* Version history */}
                      <button
                        onClick={() => onOpenVersionHistory(template)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Histórico de Versões do Modelo"
                      >
                        <History className="w-4 h-4" />
                      </button>

                      {/* Duplicate */}
                      <button
                        onClick={() => onDuplicateTemplate(template.id)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Duplicar este Modelo"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {/* Edit in Studio */}
                      <button
                        onClick={() => onSelectTemplate(template)}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Abrir Studio</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
