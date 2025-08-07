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
    const value = cell?.displayValue ?? cell?.value ?? '';
    if (title.toLowerCase().includes("date") && value && !isNaN(Date.parse(value))) {
      const date = new Date(value);
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(-2)}`;
    }
    return value;
  };

  let rows = sheet.rows;
  if (filterByEmpID) {
    rows = rows.filter(r => {
      const idVal = get(r, "Employee ID");
      return idVal && idVal.toString().toUpperCase() === empID;
    });
  }

  if (rows.length === 0) {
    container.innerHTML = `
      <h2>${title}</h2>
      <div class="empty-state">
        <p>You don’t have any records yet for <strong>${title}</strong>.</p>
      </div>`;
    return;
  }

  const colHeaderMap = {
    "submission date": "Date",
    "submission id": "ID",
    "problem statements": "Problem",
    "proposed improvement": "Improvement",
    "ci approval": "Approval",
    "assigned to (primary)": "Assigned To",
    "status": "Status",
    "action item entry date": "Action Date",
    "last meeting action item's": "Last Action",
    "token payout": "Tokens",
    "resourced": "Resourced",
    "resourced date": "Resourced On",
    "paid": "Paid"
  };

  const visibleCols = columnOrder
    ? columnOrder.filter(c => !excludeCols.includes(c))
    : sheet.columns
        .filter(c => !c.hidden && !excludeCols.includes(c.title.trim()))
        .map(c => c.title);

  let html = `<table class="dashboard-table"><thead><tr>`;

  // Headers
  visibleCols.forEach(c => {
    const norm = c.trim().toLowerCase();
    const label = colHeaderMap[norm] || c;
    html += `<th data-col="${norm}">${label}</th>`;
  });

  html += `</tr></thead><tbody class="dashboard-table-body">`;

  // Rows
  rows.forEach(r => {
    html += `<tr>`;
    visibleCols.forEach(title => {
      const val = get(r, title);
      const norm = title.trim().toLowerCase();
      const isCheck = checkmarkCols.map(c => c.toLowerCase()).includes(norm);

      let content = val;

      // Checkmarks
      if (isCheck) {
        if (val === true || val === '✓') content = `<span class="checkmark">&#10003;</span>`;
        else if (val === false || val === '✗' || val === 'X') content = `<span class="cross">&#10007;</span>`;
      }

      // Pill badge logic
      if (norm === "status") {
        const cls = ({
          "completed": "completed",
          "done": "completed",
          "open": "pending",
          "needs researched": "pending",
          "needs review": "pending",
          "in progress": "pending",
          "pending": "pending",
          "not started": "pending",
          "denied/cancelled": "denied",
          "cancelled": "denied",
          "denied": "denied",
          "approved": "approved"
        }[val.toLowerCase()] || null);
        if (cls) content = `<span class="badge ${cls}">${val}</span>`;
      }

      if (norm === "ci approval") {
        const cls = ({
          "approved": "approved",
          "pending": "pending",
          "denied": "denied"
        }[val.toLowerCase()] || null);
        if (cls) content = `<span class="badge ${cls}">${val}</span>`;
      }

      html += `<td data-col="${norm}" title="${val}">
                <div class="cell-content">${content}</div>
               </td>`;
    });
    html += `</tr>`;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}
