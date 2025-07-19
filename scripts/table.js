export function renderTable({
  sheet,
  containerId,
  title = "",
  excludeCols = [],
  checkmarkCols = [],
  filterByEmpID = true
}) {
  if (!sheet || !sheet.columns || !sheet.rows) return;

  const empId = sessionStorage.getItem("employeeId");
  const rows = filterByEmpID
    ? sheet.rows.filter(row =>
        row.cells.some(cell => String(cell.value).trim() === empId)
      )
    : sheet.rows;

  const container = document.getElementById(containerId);
  if (!container) return;

  const colTitles = sheet.columns
    .map(col => col.title.trim())
    .filter(title => !excludeCols.includes(title));

  const colIdMap = {};
  colTitles.forEach(title => {
    const col = sheet.columns.find(c => c.title.trim() === title);
    if (col) colIdMap[title] = col.id;
  });

  // Create table
  let html = `<div class="table-wrapper"><h3>${title}</h3><table><thead><tr>`;
  colTitles.forEach(title => {
    html += `<th>${title}</th>`;
  });
  html += `</tr></thead><tbody>`;

  rows.forEach(row => {
    html += `<tr>`;
    colTitles.forEach(title => {
      const cell = row.cells.find(c => c.columnId === colIdMap[title]);
      let val = cell?.displayValue ?? cell?.value ?? "";

      if (checkmarkCols.includes(title)) {
        const lower = String(val).toLowerCase();
        val = lower === "true" || lower === "yes" || val === true
          ? '<span class="checkmark">✓</span>'
          : '<span class="cross">✗</span>';
      }

      html += `<td>${val}</td>`;
    });
    html += `</tr>`;
  });

  html += `</tbody></table></div>`;
  container.innerHTML = html;
}
