function renderTable(containerId, data, columns) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  if (!data || data.length === 0) {
    container.innerHTML = '<p>No data available.</p>';
    return;
  }

  const tableWrapper = document.createElement('div');
  tableWrapper.classList.add('table-wrapper');

  const table = document.createElement('table');
  table.classList.add('data-table');

  // Create thead
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  columns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create tbody
  const tbody = document.createElement('tbody');
  data.forEach(row => {
    const tr = document.createElement('tr');
    columns.forEach(col => {
      const td = document.createElement('td');
      let value = row[col];

      // Show checkbox icon for boolean fields
      if (typeof value === 'boolean') {
        td.innerHTML = value
          ? '<span class="check-icon">✔️</span>'
          : '<span class="cross-icon">—</span>';
      } else {
        td.textContent = value ?? '';
      }

      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  tableWrapper.appendChild(table);
  container.appendChild(tableWrapper);
}
