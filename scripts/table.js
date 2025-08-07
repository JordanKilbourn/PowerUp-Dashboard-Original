// /scripts/table.js  (original logic + updated pill classes)

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

  /* ---- column id map ---- */
  const colMap = {};
  sheet.columns.forEach(c => {
    colMap[c.title.trim().toLowerCase()] = c.id;
  });

  /* ---- helper to read / format a cell ---- */
  const get = (row, title) => {
    const colId = colMap[title.toLowerCase()];
    const cell = row.cells.find(c => c.columnId === colId);
    const value = cell?.displayValue ?? cell?.value ?? '';
    if (title.toLowerCase().includes("date") && value && !isNaN(Date.parse(value))) {
      const date = new Date(value);
      return ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(-2)};
    }
    return value;
  };

  /* ---- optional employee filter ---- */
  let rows = sheet.rows;
  if (filterByEmpID) {
    rows = rows.filter(r => {
      const idVal = get(r, "Employee ID");
      return idVal && idVal.toString().toUpperCase() === empID;
    });
  }

  /* ---- empty-state ---- */
  if (rows.length === 0) {
    container.innerHTML = 
      <h2>${title}</h2>
      <div class="empty-state">
        <p>You don’t have any records yet for <strong>${title}</strong>.</p>
      </div>;
    return;
  }

  /* ---- header label overrides ---- */
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

  /* ---- width / alignment helpers ---- */
  const narrowCols   = ["submission date","submission id","token payout","resourced","resourced date","action item entry date","paid"];
  const mediumCols   = ["status","assigned to (primary)","ci approval"];
  const wideCols     = ["problem statements","proposed improvement","last meeting action item's"];
  const centeredCols = [...narrowCols];

  /* ---- choose visible columns ---- */
  const visibleCols = columnOrder
    ? columnOrder.filter(c => !excludeCols.includes(c))
    : sheet.columns
        .filter(c => !c.hidden && !excludeCols.includes(c.title.trim()))
        .map(c => c.title);

  /* ======== BUILD HTML ======== */
  let html = <div class="dashboard-table-container"><table class="dashboard-table">
    <thead><tr>;

  /* headers */
  visibleCols.forEach(c => {
    const norm = c.trim().toLowerCase();
    const label = colHeaderMap[norm] || c;

    let widthClass = '';
    if (narrowCols.includes(norm))      widthClass = 'col-narrow';
    else if (mediumCols.includes(norm)) widthClass = 'col-medium';
    else if (wideCols.includes(norm))   widthClass = 'col-wide';

    const centered = centeredCols.includes(norm) ? 'centered' : '';
    html += <th class="${widthClass} ${centered}" data-col="${norm}">${label}</th>;
  });

  html += </tr></thead><tbody class="dashboard-table-body">;

  /* rows */
  rows.forEach(r => {
    html += <tr>;
    visibleCols.forEach(title => {
      const val  = get(r, title);
      const norm = title.trim().toLowerCase();
      const isCheck = checkmarkCols.map(c => c.toLowerCase()).includes(norm);

      let content = val;

      /* ✓ / ✗ for checkmark columns */
      if (isCheck) {
        if (val === true || val === '✓')         content = <span class="checkmark">&#10003;</span>;
        else if (val === false || val === '✗' || val === 'X')
                                                content = <span class="cross">&#10007;</span>;
      }

      /* ---------- updated pill logic ---------- */
      if (norm === "status") {
        const cls = ({
          "completed"       : "completed",
          "done"            : "completed",
          "open"            : "pending",
          "needs researched": "pending",
          "needs review"    : "pending",
          "in progress"     : "pending",
          "pending"         : "pending",
          "not started"     : "pending",
          "denied/cancelled": "denied",
          "cancelled"       : "denied",
          "denied"          : "denied",
          "approved"        : "approved"
        }[val.toLowerCase()] || null);
        if (cls) content = <span class="badge ${cls}">${val}</span>;
      }

      if (norm === "ci approval") {
        const cls = ({
          "approved": "approved",
          "pending" : "pending",
          "denied"  : "denied"
        }[val.toLowerCase()] || null);
        if (cls) content = <span class="badge ${cls}">${val}</span>;
      }
      /* ---------------------------------------- */

      let widthClass = '';
      if (narrowCols.includes(norm))      widthClass = 'col-narrow';
      else if (mediumCols.includes(norm)) widthClass = 'col-medium';
      else if (wideCols.includes(norm))   widthClass = 'col-wide';

      const centered = centeredCols.includes(norm) ? 'centered' : '';

      html += <td class="${widthClass} ${centered}" data-col="${norm}" title="${val}">
                <div class="cell-content">${content}</div>
               </td>;
    });
    html += </tr>;
  });

  html += </tbody></table></div>;
  container.innerHTML = html;
}
