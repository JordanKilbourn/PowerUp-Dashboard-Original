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

  // Map column title (lowercased) -> columnId
  const colMap = {};
  sheet.columns.forEach(c => {
    colMap[c.title.trim().toLowerCase()] = c.id;
  });

  // Cell getter (formats dates as mm/dd/yy)
  const get = (row, title) => {
    const colId = colMap[String(title).toLowerCase()];
    const cell  = row.cells.find(c => c.columnId === colId);
    const value = cell?.displayValue ?? cell?.value ?? '';
    if (String(title).toLowerCase().includes("date") && value && !isNaN(Date.parse(value))) {
      const d = new Date(value);
      return `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear().toString().slice(-2)}`;
    }
    return value;
  };

  // Filter to current employee unless told otherwise
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

  // Header labels for friendlier column names
  const colHeaderMap = {
    // CI headers
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
    "paid": "Paid",

    // Safety headers (long originals → compact labels)
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

  // Long-text columns (get clamped to 3 lines by CSS)
  const LONG_TEXT = new Set([
    "problem statements",
    "proposed improvement",
    "description",
    "recommendations to correct/improve safety issue",
    "resolution",
    "leadership update"
  ]);

  // Legacy classes are harmless if present; they won't be styled
  const narrowCols  = ["submission date", "submission id", "token payout", "action item entry date", "paid"];
  const mediumCols  = ["status", "assigned to (primary)", "ci approval"];
  const wideCols    = ["problem statements", "proposed improvement", "last meeting action item's"];
  const centeredCols = [...narrowCols];

  // Visible column order
  const visibleCols = columnOrder
    ? columnOrder.filter(c => !excludeCols.includes(c))
    : sheet.columns.filter(c => !c.hidden && !excludeCols.includes(c.title.trim())).map(c => c.title);

  // Build table
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
    const longFlag = LONG_TEXT.has(normalizedCol) ? ' long' : '';

    html += `<th class="${widthClass} ${centered}${longFlag}" data-col="${normalizedCol}">${label}</th>`;
  });

  html += `</tr></thead><tbody class="dashboard-table-body">`;

  rows.forEach(r => {
    html += `<tr>`;
    visibleCols.forEach(title => {
      const val = get(r, title);
      const normalizedCol = title.trim().toLowerCase();
      const isCheck = checkmarkCols.map(c => c.toLowerCase()).includes(normalizedCol);

      let content = val;

      // Checkmark columns (✓ / ✗ / X)
      if (isCheck) {
        if (val === true || val === '✓') {
          content = `<span class="checkmark">&#10003;</span>`;
        } else if (val === false || val === '✗' || val === 'X') {
          content = `<span class="cross">&#10007;</span>`;
        }
      }

      // Pill badges for CI & Safety-like statuses
      if (normalizedCol === "status") {
        const cls = ({
          // CI states
          'completed': 'completed',
          'done': 'completed',
          'denied/cancelled': 'denied',
          'cancelled': 'denied',
          'needs researched': 'pending',
          'needs research': 'pending',
          'needs review': 'pending',
          'in progress': 'pending',
          'open': 'pending',
          'not started': 'pending',
          // Safety (your request: make Accepted Safety Concern green)
          'accepted safety concern': 'approved'
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
      const longFlag = LONG_TEXT.has(normalizedCol) ? ' long' : '';

      html += `<td class="${widthClass} ${centered}${longFlag}" data-col="${normalizedCol}" title="${val}">
        <div class="cell-content">${content}</div>
      </td>`;
    });
    html += `</tr>`;
  });

  html += `</tbody></table></div>`;
  container.innerHTML = html;
}
