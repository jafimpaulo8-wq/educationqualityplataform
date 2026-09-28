/**
 * Utilitário para exportação de relatórios em formato nativo Microsoft Excel (.xls / Spreadsheet XML)
 * Suporta formatação de cabeçalho, cores institucionais, formatação de números e texto em UTF-8
 */

export function exportToExcel(
  filename: string,
  sheetName: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][],
  title?: string,
  metaInfo?: { label: string; value: string | number }[]
): void {
  const safeFilename = filename.endsWith('.xls') ? filename : `${filename}.xls`;

  let metaHtml = '';
  if (metaInfo && metaInfo.length > 0) {
    metaHtml = `
      <tr>
        <td colspan="${headers.length}" style="background-color: #f1f5f9; color: #475569; font-size: 11px; padding: 6px; font-weight: bold;">
          ${metaInfo.map(m => `<b>${m.label}:</b> ${m.value}`).join(' &nbsp;|&nbsp; ')}
        </td>
      </tr>
      <tr><td colspan="${headers.length}" style="height: 10px;"></td></tr>
    `;
  }

  const titleHtml = title ? `
    <tr>
      <th colspan="${headers.length}" style="font-size: 16px; font-weight: bold; background-color: #0f172a; color: #ffffff; text-align: center; padding: 14px; border: 1px solid #1e293b;">
        ${title}
      </th>
    </tr>
    <tr>
      <td colspan="${headers.length}" style="font-size: 10px; color: #64748b; text-align: right; padding: 4px;">
        Gerado pelo SIGAR • Moztechwave em ${new Date().toLocaleDateString('pt-MZ')} às ${new Date().toLocaleTimeString('pt-MZ')}
      </td>
    </tr>
    ${metaHtml}
  ` : '';

  const headerRowHtml = `
    <tr style="background-color: #0891b2; color: #ffffff; font-weight: bold; text-align: left;">
      ${headers.map(h => `<th style="padding: 10px 12px; border: 1px solid #0e7490; font-size: 12px;">${h}</th>`).join('')}
    </tr>
  `;

  const bodyRowsHtml = rows.map((row, idx) => {
    const bgColor = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    return `
      <tr style="background-color: ${bgColor};">
        ${row.map(cell => {
          const val = cell === null || cell === undefined ? '' : String(cell);
          const isNum = typeof cell === 'number';
          return `<td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 11px; color: #1e293b; text-align: ${isNum ? 'right' : 'left'};">${val}</td>`;
        }).join('')}
      </tr>
    `;
  }).join('');

  const excelTemplate = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>${sheetName.replace(/[\\/*?:[\]]/g, '')}</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; font-family: 'Segoe UI', Arial, sans-serif; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            ${titleHtml}
            ${headerRowHtml}
          </thead>
          <tbody>
            ${bodyRowsHtml}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', safeFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
