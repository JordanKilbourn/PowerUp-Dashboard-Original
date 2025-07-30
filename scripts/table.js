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
  if (filterByEmpID) {
    rows = rows.filter(r => {
      const idVal = get(r, "Employee ID");
      return idVal && idVal.toString().toUpperCase() === empID;
    });
  }

  if (rows.length === 0) {
    container.innerHTML = `<h2>${title}</h2><p>No records found.</p>`;
    return;
  }

  // Define column display titles and widths
  const headerMap = {
    "submission id": "ID",
    "submission date": "Date",
    "problem statements": "Problem",
    "proposed improvement": "Improvement",
    "ci approval": "CI Decision",
    "assigned to (primary)": "Owner",
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
    : sheet.columns.filter(c =>
        !c.hidden && !excludeCols.includes(c.title.trim())
      ).map(c => c.title);

  let html = `<div class="dashboard-table-container"><table class="dashboard-table">
    <thead>
      <tr>`;
  visibleCols.forEach(title => {
    const label = headerMap[title.trim().toLowerCase()] || title;
    html += `<th>${label}</th>`;
  });
  html += `</tr></thead><tbody class="dashboard-table-body">`;

  rows.forEach(r => {
    html += `<tr>`;
    visibleCols.forEach(title => {
      const val = get(r, title);
      const rawVal = val?.toString().trim();
      const lowerTitle = title.toLowerCase();

      // Date formatting for submission date
      if (lowerTitle === "submission date" && val) {
        const dateObj = new Date(val);
        const content = !isNaN(dateObj) ? dateObj.toLocaleDateString("en-US") : val;
        html += `<td title="${val}">${content}</td>`;
        return;
      }

      // Badge formatting for status
      if (lowerTitle === "status") {
        const statusClass = {
          "not started": "badge-pending",
          "open": "badge-in-review",
          "needs researched": "badge-in-review",
          "completed": "badge-success",
          "denied/cancelled": "badge-denied"
        }[rawVal?.toLowerCase()] || "";

        html += `<td><span class="badge ${statusClass}">${val}</span></td>`;
        return;
      }

      // Badge formatting for CI approval
      if (lowerTitle === "ci approval") {
        const approvalClass = {
          "approved": "badge-success",
          "pending": "badge-pending",
          "denied": "badge-denied"
        }[rawVal?.toLowerCase()] || "";

        html += `<td><span class="badge ${approvalClass}">${val}</span></td>`;
        return;
      }

      // Checkbox rendering
      const isCheck = checkmarkCols.map(c => c.toLowerCase()).includes(lowerTitle);
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
