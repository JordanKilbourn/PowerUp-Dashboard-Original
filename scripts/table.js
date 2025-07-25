// /scripts/table.js

export function renderTable({
  sheet,
  containerId,
  title = '',
  filterByEmpID = true,
  checkmarkCols = [],
  excludeCols = [],
  columnOrder = null
}) {
  const empID = sessionStorage.getItem("empID");
  const container = document.getElementById(containerId);
  if (!sheet || !container) return;

  const colMap = {};
  sheet.columns.forEach(c => {
    colMap[c.title.trim().toLowerCase()] = c.id;
  });

  const get = (row, title) => {
    const colId = colMap[title.toLowerCase()];
    const cell = row.cells.find(c => c.columnId === colId);
    return cell?.displayValue ?? cell?.value ?? '';
  };

  let rows = sheet.rows;

  // 🔧 Quick debug bypass: skip filtering for Safety Concerns
  if (filterByEmpID && title !== "Safety Concerns") {
    rows = rows.filter(r => {
      const idVal = get(r, "Employee ID");
      return idVal && idVal.toString().toUpperCase() === empID;
    });
  }

  if (rows.length === 0) {
    container.innerHTML = `<h2>${title}</h2><p>No records found.</p>`;
    return;
  }

  // Columns to show
  const visibleCols = columnOrder
    ? columnOrder.filter(c => !excludeCols.includes(c))
    : sheet.columns.filter(c =>
        !c.hidden && !excludeCols.includes(c.title.trim())
      ).map(c => c.title);

  let html = `<div class="dashboard-table-container"><table class="dashboard-table">
    <thead>
      <tr>`;
  visibleCols.forEach(c => {
    html += `<th>${c}</th>`;
  });
  html += `</tr></thead><tbody class="dashboard-table-body">`;

  rows.forEach(r => {
    html += `<tr>`;
    visibleCols.forEach(title => {
      const val = get(r, title);
      const isCheck = checkmarkCols.map(c => c.toLowerCase()).includes(title.toLowerCase());

      let content = val;
      if (isCheck) {
        if (val === true || val === '✓') {
          content = `<span class="checkmark">&#10003;</span>`;
        } else if (val === false || val === '✗' || val === 'X') {
          content = `<span class="cross">&#10007;</span>`;
        }
      }

      html += `<td title="${val}">${content}</td>`;
    });
    html += `</tr>`;
  });

  html += `</tbody></table></div>`;
  container.innerHTML = html;
}
