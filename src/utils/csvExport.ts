/**
 * Utilitário para exportação de dados tabulares em formato CSV / Excel (UTF-8 com BOM)
 */
export function exportToCsv(filename: string, rows: (string | number | undefined | null)[][]): void {
  // UTF-8 BOM para garantir acentuação correta no Excel no Windows e Mac
  const BOM = '\uFEFF';
  
  const csvContent = rows
    .map(row => 
      row
        .map(cell => {
          if (cell === null || cell === undefined) return '""';
          const stringValue = String(cell).replace(/"/g, '""');
          return `"${stringValue}"`;
        })
        .join(';')
    )
    .join('\r\n');

  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.endsWith('.csv') ? filename : `${filename}.csv`}`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
