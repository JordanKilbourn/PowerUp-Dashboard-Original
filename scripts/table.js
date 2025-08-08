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

  const narrowCols = ["submission date", "submission id", "token payout", "resourced", "resourced date", "action item entry date", "paid"];
  const mediumCols = ["status", "assigned to (primary)", "ci approval"];
  const wideCols = ["problem statements", "proposed improvement", "last meeting action item's"];
  const centeredCols = [...narrowCols];

  const visibleCols = columnOrder
    ? columnOrder.filter(c => !excludeCols.includes(c))
    : sheet.columns.filter(c =>
        !c.hidden && !excludeCols.includes(c.title.trim())
      ).map(c => c.title);

  let html = `<div class="dashboard-table-container"><table class="dashboard-table">
    <thead><tr>`;
  visibleCols.forEach(c => {
    const normalizedCol = c.trim().toLowerCase();
    const label = colHeaderMap[normalizedCol] || c;

    let widthClass = '';
    if (narrowCols.includes(normalizedCol)) widthClass = 'col-narrow';
    else if (mediumCols.includes(normalizedCol)) widthClass = 'col-medium';
    else if (wideCols.includes(normalizedCol)) widthClass = 'col-wide';

    const centered = centeredCols.includes(normalizedCol) ? 'centered' : '';
    html += `<th class="${widthClass} ${centered}" data-col="${normalizedCol}">${label}</th>`;
  });
  html += `</tr></thead><tbody class="dashboard-table-body">`;

  rows.forEach(r => {
    html += `<tr>`;
    visibleCols.forEach(title => {
      const val = get(r, title);
      const normalizedCol = title.trim().toLowerCase();
      const isCheck = checkmarkCols.map(c => c.toLowerCase()).includes(normalizedCol);

      let content = val;
      if (isCheck) {
        if (val === true || val === '✓') {
          content = `<span class="checkmark">&#10003;</span>`;
        } else if (val === false || val === '✗' || val === 'X') {
          content = `<span class="cross">&#10007;</span>`;
        }
      }

      if (normalizedCol === "status") {
        const badgeClass = {
          "not started": "badge-gray",
          "open": "badge-blue",
          "needs researched": "badge-yellow",
          "completed": "badge-green",
          "denied/cancelled": "badge-red"
        }[String(val).toLowerCase()] || "badge-default";
        content = `<span class="badge ${badgeClass}">${val}</span>`;
      }

      if (normalizedCol === "ci approval") {
        const badgeClass = {
          "approved": "badge-green",
          "pending": "badge-yellow",
          "denied": "badge-red"
        }[String(val).toLowerCase()] || "badge-default";
        content = `<span class="badge ${badgeClass}">${val}</span>`;
      }

      let widthClass = '';
      if (narrowCols.includes(normalizedCol)) widthClass = 'col-narrow';
      else if (mediumCols.includes(normalizedCol)) widthClass = 'col-medium';
      else if (wideCols.includes(normalizedCol)) widthClass = 'col-wide';

      const centered = centeredCols.includes(normalizedCol) ? 'centered' : '';

      html += `<td class="${widthClass} ${centered}" data-col="${normalizedCol}" title="${val}">
        <div class="cell-content">${content}</div>
      </td>`;
    });
    html += `</tr>`;
  });

  html += `</tbody></table></div>`;
  container.innerHTML = html;
}
