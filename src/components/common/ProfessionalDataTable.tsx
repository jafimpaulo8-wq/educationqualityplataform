import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  SlidersHorizontal,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  render?: (row: T, index: number) => React.ReactNode;
  accessor?: (row: T) => any;
}

export interface QuickAction<T> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'warning' | 'danger';
  onClick: (row: T) => void;
  show?: (row: T) => boolean;
}

export interface FilterOption {
  id: string;
  label: string;
  options: { label: string; value: string }[];
}

interface ProfessionalDataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  idAccessor: (row: T) => string;
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  searchKeys?: (keyof T | string)[];
  filters?: FilterOption[];
  quickActions?: QuickAction<T>[];
  primaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  onRowClick?: (row: T) => void;
  exportFileName?: string;
  renderMobileCard?: (row: T, actions?: QuickAction<T>[]) => React.ReactNode;
  emptyMessage?: string;
  defaultRowsPerPage?: number;
  badgeContent?: React.ReactNode;
}

export function ProfessionalDataTable<T extends Record<string, any>>({
  data,
  columns,
  idAccessor,
  title,
  subtitle,
  searchPlaceholder = 'Pesquisar...',
  searchKeys,
  filters,
  quickActions,
  primaryAction,
  onRowClick,
  exportFileName = 'SIGAR_Export',
  renderMobileCard,
  emptyMessage = 'Nenhum registo encontrado com os critérios selecionados.',
  defaultRowsPerPage = 10,
  badgeContent
}: ProfessionalDataTableProps<T>) {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Sorting State
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  // Selection State (for bulk actions)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Export dropdown state
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // 1. FILTERING & SEARCHING
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply active categorical filters
    Object.entries(activeFilters).forEach(([filterId, filterValue]) => {
      if (filterValue && filterValue !== 'all') {
        result = result.filter(row => {
          const val = String((row as Record<string, unknown>)[filterId] ?? '').toLowerCase();
          return val === String(filterValue).toLowerCase();
        });
      }
    });

    // Apply Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(row => {
        if (searchKeys && searchKeys.length > 0) {
          return searchKeys.some(key => {
            const val = row[key as string];
            return val !== undefined && val !== null && String(val).toLowerCase().includes(q);
          });
        }
        // Fallback: search across all primitive fields
        return Object.values(row).some(v => 
          v !== undefined && v !== null && typeof v !== 'object' && String(v).toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [data, searchQuery, activeFilters, searchKeys]);

  // 2. SORTING
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    const colDef = columns.find(c => c.key === sortColumn);
    if (!colDef) return filteredData;

    return [...filteredData].sort((a, b) => {
      let valA = colDef.accessor ? colDef.accessor(a) : a[sortColumn];
      let valB = colDef.accessor ? colDef.accessor(b) : b[sortColumn];

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      return sortDirection === 'asc' 
        ? strA.localeCompare(strB, 'pt') 
        : strB.localeCompare(strA, 'pt');
    });
  }, [filteredData, sortColumn, sortDirection, columns]);

  // 3. PAGINATION
  const totalRecords = sortedData.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedData = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, safeCurrentPage, rowsPerPage]);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null); // Reset sort
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginatedData.map(row => idAccessor(row)));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    setSelectedIds(next);
  };

  // EXPORT UTILITIES
  const exportToCSV = () => {
    const exportColumns = columns.filter(c => c.key !== 'actions' && c.key !== 'select');
    const headers = exportColumns.map(c => `"${c.header.replace(/"/g, '""')}"`).join(',');
    
    const rows = sortedData.map(row => {
      return exportColumns.map(c => {
        const rawVal = c.accessor ? c.accessor(row) : row[c.key];
        const val = rawVal !== undefined && rawVal !== null ? String(rawVal) : '';
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exportFileName}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setIsExportMenuOpen(false);
  };

  const exportToJSON = () => {
    const jsonStr = JSON.stringify(sortedData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exportFileName}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setIsExportMenuOpen(false);
  };

  const handlePrint = () => {
    window.print();
    setIsExportMenuOpen(false);
  };

  const activeFilterCount = Object.values(activeFilters).filter(v => v && v !== 'all').length;

  return (
    <div className="bg-[#0b1120] border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col space-y-0">
      {/* 1. Header Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0d1527]/90 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            {title && (
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                {title}
                {badgeContent}
              </h3>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Primary Action Button */}
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-900/30 active:scale-95 transition-all"
            >
              {primaryAction.icon}
              <span>{primaryAction.label}</span>
            </button>
          )}

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111c35] border border-slate-700/80 text-slate-200 hover:text-white text-xs font-medium hover:border-slate-600 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Exportar</span>
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-[#0d1527] border border-slate-700 rounded-xl shadow-2xl z-40 py-1 text-xs">
                <button
                  onClick={exportToCSV}
                  className="w-full px-3 py-2 text-left text-slate-200 hover:bg-blue-600/20 hover:text-blue-300 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Planilha CSV (Excel)</span>
                </button>
                <button
                  onClick={exportToJSON}
                  className="w-full px-3 py-2 text-left text-slate-200 hover:bg-blue-600/20 hover:text-blue-300 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  <span>Ficheiro JSON</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full px-3 py-2 text-left text-slate-200 hover:bg-blue-600/20 hover:text-blue-300 flex items-center gap-2"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Imprimir / PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Search & Filters Bar */}
      <div className="p-3.5 sm:p-4 bg-[#090e1a] border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset page on search
            }}
            className="w-full pl-9 pr-8 py-2 bg-[#0d1527] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {filters && filters.map(f => (
            <select
              key={f.id}
              value={activeFilters[f.id] || 'all'}
              onChange={e => {
                setActiveFilters(prev => ({ ...prev, [f.id]: e.target.value }));
                setCurrentPage(1);
              }}
              className="bg-[#0d1527] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-blue-500 font-medium"
            >
              <option value="all">Todos ({f.label})</option>
              {f.options.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-[#0d1527] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          ))}

          {/* Reset Filters button */}
          {(searchQuery || activeFilterCount > 0) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilters({});
                setCurrentPage(1);
              }}
              className="px-2.5 py-2 text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
              title="Limpar filtros"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Table Presentation (Desktop) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-[#0d1527]/90 text-slate-400 font-bold uppercase text-[10px] tracking-wider select-none">
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={paginatedData.length > 0 && paginatedData.every(r => selectedIds.has(idAccessor(r)))}
                  onChange={e => handleSelectAll(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              {columns.map(col => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={`py-3 px-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${
                    col.sortable ? 'cursor-pointer hover:text-white transition-colors' : ''
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className={`flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-slate-500">
                        {sortColumn === col.key ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="w-3 h-3 text-amber-400" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-amber-400" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {quickActions && quickActions.length > 0 && (
                <th className="py-3 px-4 text-right">Ações</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 bg-[#090d16]">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (quickActions ? 2 : 1)} className="text-center py-12 text-slate-500 text-xs">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => {
                const id = idAccessor(row);
                const isSelected = selectedIds.has(id);

                return (
                  <tr
                    key={id}
                    className={`hover:bg-[#111c35]/50 transition-colors group cursor-pointer ${
                      isSelected ? 'bg-blue-900/10' : ''
                    }`}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={e => handleSelectRow(id, e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    {columns.map(col => (
                      <td
                        key={col.key}
                        className={`py-3 px-4 text-slate-300 ${
                          col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                        }`}
                      >
                        {col.render ? col.render(row, index) : (row[col.key] !== undefined ? String(row[col.key]) : '-')}
                      </td>
                    ))}
                    {quickActions && quickActions.length > 0 && (
                      <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {quickActions.map(act => {
                            if (act.show && !act.show(row)) return null;
                            return (
                              <button
                                key={act.id}
                                onClick={() => act.onClick(row)}
                                title={act.label}
                                className="p-1.5 rounded-lg bg-[#111c35] hover:bg-blue-600 text-slate-300 hover:text-white transition-colors"
                              >
                                {act.icon || <Eye className="w-3.5 h-3.5" />}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Adaptive Cards Presentation (Mobile) */}
      <div className="block md:hidden p-3 space-y-3 bg-[#090d16]">
        {paginatedData.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            {emptyMessage}
          </div>
        ) : (
          paginatedData.map((row) => {
            const id = idAccessor(row);

            if (renderMobileCard) {
              return (
                <div key={id} onClick={() => onRowClick && onRowClick(row)}>
                  {renderMobileCard(row, quickActions)}
                </div>
              );
            }

            // Default card presentation
            return (
              <div
                key={id}
                onClick={() => onRowClick && onRowClick(row)}
                className="bg-[#0d1527] border border-slate-800 rounded-xl p-3.5 space-y-3 shadow-md active:bg-[#111c35]/70"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    {columns.slice(0, 2).map(col => (
                      <div key={col.key}>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                          {col.header}
                        </span>
                        <div className="text-xs text-white font-medium">
                          {col.render ? col.render(row, 0) : String(row[col.key] || '-')}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    {quickActions?.map(act => (
                      <button
                        key={act.id}
                        onClick={() => act.onClick(row)}
                        title={act.label}
                        className="p-1.5 rounded-lg bg-[#111c35] text-slate-300 hover:text-white"
                      >
                        {act.icon || <Eye className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  {columns.slice(2).map(col => (
                    <div key={col.key}>
                      <span className="text-[10px] text-slate-500 block font-semibold">{col.header}:</span>
                      <span className="text-slate-300">
                        {col.render ? col.render(row, 0) : String(row[col.key] || '-')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Footer Pagination Bar */}
      <div className="p-3.5 sm:p-4 bg-[#0d1527]/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span>
            Mostrando <strong className="text-white">{totalRecords > 0 ? (safeCurrentPage - 1) * rowsPerPage + 1 : 0}</strong> a{' '}
            <strong className="text-white">{Math.min(safeCurrentPage * rowsPerPage, totalRecords)}</strong> de{' '}
            <strong className="text-amber-400">{totalRecords}</strong> registos
          </span>

          <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-slate-800">
            <span className="text-[11px] text-slate-500">Linhas:</span>
            <select
              value={rowsPerPage}
              onChange={e => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#090d16] border border-slate-800 rounded-lg px-2 py-1 text-slate-200 focus:outline-hidden text-xs"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={safeCurrentPage <= 1}
            className="p-1.5 rounded-lg bg-[#090d16] border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            title="Página Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-2.5 py-1 text-xs font-mono text-slate-300">
            Pág. <strong className="text-white">{safeCurrentPage}</strong> de {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={safeCurrentPage >= totalPages}
            className="p-1.5 rounded-lg bg-[#090d16] border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            title="Página Seguinte"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
