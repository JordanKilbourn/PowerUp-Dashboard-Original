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
    // ---- CI (existing) ----
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
    "paid": "Paid",

    // ---- SAFETY (NEW labels) ----
    "date": "Date",
    "facility": "Facility",
    "department/area": "Department/Area",
    "safety concern": "Safety Concern",
    "describe the safety concern": "Description",
    "recommendations to correct/improve safety issue": "Recommendations",
    "resolution": "Resolution",
    "maintenance work order number or type na if no w/o": "Work Order",
    "who was the safety concern escalated to": "Escalated To",
    "did you personally speak to the leadership": "Spoke to Leadership",
    "leadership update": "Leadership Update"
  };

  const narrowCols = ["submission date", "submission id", "token payout", "action item entry date", "paid"];
  const mediumCols = ["status", "assigned to (primary)", "ci approval"];
  const wideCols = ["problem statements", "proposed improvement", "last meeting action item's"];
  const centeredCols = [...narrowCols];

  const visibleCols = columnOrder
    ? columnOrder.filter(c => !excludeCols.includes(c))
    : sheet.columns
        .filter(c => !c.hidden && !excludeCols.includes(c.title.trim()))
        .map(c => c.title);

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
        if (val === true || val === '✓' || String(val).toLowerCase() === 'y' || String(val).toLowerCase() === 'yes') {
          content = `<span class="checkmark">&#10003;</span>`;
        } else if (val === false || val === '✗' || val === 'X' || String(val).toLowerCase() === 'n' || String(val).toLowerCase() === 'no') {
          content = `<span class="cross">&#10007;</span>`;
        }
      }

      if (normalizedCol === "status") {
        const cls = ({
          'completed': 'completed',
          'done': 'completed',
          'denied/cancelled': 'denied',
          'cancelled': 'denied',
          'accepted safety concern': 'pending',   // keep yellow (change to 'approved' if you want green)
          'needs researched': 'pending',
          'needs research': 'pending',
          'needs review': 'pending',
          'in progress': 'pending',
          'open': 'pending',
          'not started': 'pending'
        }[String(val).toLowerCase()] || 'pending');
        content = `<span class="badge ${cls}">${val}</span>`;
      }

      if (normalizedCol === "ci approval") {
        const cls = ({
          'approved': 'approved',
          'pending': 'pending',
          'denied': 'denied',
          'rejected': 'denied'
        }[String(val).toLowerCase()] || 'pending');
        content = `<span class="badge ${cls}">${val}</span>`;
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
