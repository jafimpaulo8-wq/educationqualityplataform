import React from 'react';
import { 
  BookOpen, 
  FileCheck2, 
  Users, 
  CheckSquare, 
  Sparkles, 
  CreditCard, 
  Cake, 
  Briefcase,
  Check,
  RotateCcw
} from 'lucide-react';
import { CalendarCategoryType } from '../../../types';
import { CATEGORY_CONFIG } from '../utils/calendarAggregation';

interface CalendarCategoryFilterProps {
  selectedCategories: CalendarCategoryType[];
  onChange: (categories: CalendarCategoryType[]) => void;
  categoryCounts: Record<CalendarCategoryType, number>;
}

const CATEGORY_ICONS: Record<CalendarCategoryType, React.ReactNode> = {
  aula: <BookOpen className="w-3.5 h-3.5" />,
  avaliacao: <FileCheck2 className="w-3.5 h-3.5" />,
  reuniao: <Users className="w-3.5 h-3.5" />,
  tarefa: <CheckSquare className="w-3.5 h-3.5" />,
  evento: <Sparkles className="w-3.5 h-3.5" />,
  pagamento: <CreditCard className="w-3.5 h-3.5" />,
  aniversario: <Cake className="w-3.5 h-3.5" />,
  estagio: <Briefcase className="w-3.5 h-3.5" />
};

const ALL_CATEGORIES: CalendarCategoryType[] = [
  'aula',
  'avaliacao',
  'reuniao',
  'tarefa',
  'evento',
  'pagamento',
  'aniversario',
  'estagio'
];

export const CalendarCategoryFilter: React.FC<CalendarCategoryFilterProps> = ({
  selectedCategories,
  onChange,
  categoryCounts
}) => {
  const toggleCategory = (cat: CalendarCategoryType) => {
    if (selectedCategories.includes(cat)) {
      // Don't allow empty if only 1 is selected, or allow toggle
      if (selectedCategories.length === 1) {
        // select all if last is toggled off
        onChange(ALL_CATEGORIES);
      } else {
        onChange(selectedCategories.filter(c => c !== cat));
      }
    } else {
      onChange([...selectedCategories, cat]);
    }
  };

  const selectAll = () => onChange(ALL_CATEGORIES);
  const selectOnly = (cat: CalendarCategoryType) => onChange([cat]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Categorias do Calendário (8)
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {selectedCategories.length} de {ALL_CATEGORIES.length} ativas
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={selectAll}
            className="px-2.5 py-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 font-medium"
          >
            <Check className="w-3 h-3 text-emerald-400" />
            Todas
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={() => onChange(['reuniao', 'tarefa', 'evento'])}
            className="px-2.5 py-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 font-medium"
          >
            <RotateCcw className="w-3 h-3 text-amber-400" />
            Operacionais
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {ALL_CATEGORIES.map(cat => {
          const config = CATEGORY_CONFIG[cat];
          const isSelected = selectedCategories.includes(cat);
          const count = categoryCounts[cat] || 0;

          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              onDoubleClick={() => selectOnly(cat)}
              title={`Clique para alternar. Duplo clique para focar apenas em ${config.pluralLabel}.`}
              className={`flex items-center justify-between gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-medium transition-all duration-150 text-left ${
                isSelected
                  ? `${config.badgeBg} ${config.textColor} ${config.borderColor} shadow-xs`
                  : 'bg-slate-800/40 text-slate-500 border-slate-800/70 opacity-60 hover:opacity-90'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className={isSelected ? config.textColor : 'text-slate-500'}>
                  {CATEGORY_ICONS[cat]}
                </span>
                <span className="truncate">{config.pluralLabel}</span>
              </div>
              <span 
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
                  isSelected ? 'bg-black/30 font-bold' : 'bg-slate-800 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
