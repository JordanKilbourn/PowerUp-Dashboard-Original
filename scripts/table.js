function renderTable({ containerId, sheet, title, excludeCols = [], checkmarkCols = [], filterByEmpID = false }) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  if (!sheet || !sheet.rows || sheet.rows.length === 0) {
    container.innerHTML = '<p>No data available.</p>';
    return;
  }

  const tableWrapper = document.createElement('div');
  tableWrapper.classList.add('table-wrapper');

  const table = document.createElement('table');
  table.classList.add('dashboard-table');

  // Filter columns
  const columns = sheet.columns.filter(col => !excludeCols.includes(col.title));
  if (filterByEmpID) {
    const empID = sessionStorage.getItem('empID');
    sheet.rows = sheet.rows.filter(row =>
      row.cells.some(cell => String(cell.value).toUpperCase() === empID)
    );
  }

  // Create thead
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  columns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col.title;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create tbody
  const tbody = document.createElement('tbody');
  sheet.rows.forEach(row => {
    const tr = document.createElement('tr');
    columns.forEach(col => {
      const cell = row.cells.find(c => c.columnId === col.id);
      const td = document.createElement('td');
      let value = cell?.displayValue || cell?.value || '';

      if (checkmarkCols.includes(col.title) && typeof value === 'boolean') {
        td.innerHTML = value
          ? '<span class="check-icon">✔️</span>'
          : '<span class="cross-icon">—</span>';
      } else {
        td.textContent = value;
      }

      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  tableWrapper.appendChild(table);
  container.appendChild(tableWrapper);
}
