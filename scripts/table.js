export async function renderTable({ sheetId, containerId }) {
  try {
    const response = await fetch(`/smartsheet/${sheetId}`);
    const { columns, rows } = await response.json();

    const table = document.createElement('table');
    table.classList.add('dashboard-table'); // match your CSS class

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');

    columns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.title;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    rows.forEach(row => {
      const tr = document.createElement('tr');
      columns.forEach(col => {
        const td = document.createElement('td');
        const cell = row.cells.find(c => c.columnId === col.id);
        const val = cell?.displayValue ?? '';

        // Optional checkbox styling
        if (typeof val === 'boolean') {
          td.innerHTML = val ? '<span class="checkmark">✔</span>' : '<span class="cross">✖</span>';
        } else {
          td.textContent = val;
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    const container = document.getElementById(containerId);
    container.innerHTML = ''; // clear previous
    container.appendChild(table);
  } catch (error) {
    console.error(`Failed to load table for sheet ${sheetId}:`, error);
  }
}
