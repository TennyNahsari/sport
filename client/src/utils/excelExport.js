export function exportToCsv(filename, rows, headers) {
  if (!rows || !rows.length) {
    alert('Tidak ada data untuk diexport.');
    return;
  }

  const separator = ',';
  const keys = Object.keys(headers);
  
  // UTF-8 BOM for Microsoft Excel compatibility
  let csvContent = '\uFEFF';
  
  // Header row
  csvContent += keys.map(k => `"${(headers[k] || '').replace(/"/g, '""')}"`).join(separator) + '\n';
  
  // Data rows
  rows.forEach(row => {
    const line = keys.map(k => {
      let val = row[k] === null || row[k] === undefined ? '' : row[k];
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    }).join(separator);
    csvContent += line + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
