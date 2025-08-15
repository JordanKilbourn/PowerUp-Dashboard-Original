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
  const el = document.getElementById(containerId);
  if (!sheet || !el) return;

  /* Build a quick title->columnId map */
  const colMap = {};
  sheet.columns.forEach(c => {
    colMap[c.title.trim().toLowerCase()] = c.id;
  });

  const get = (row, title) => {
    const colId = colMap[title.toLowerCase()];
    const cell = row.cells.find(c => c.columnId === colId);
    const value = cell?.displayValue ?? cell?.value ?? '';

    // Nice short dates (MM/DD/YY) for anything labeled like a date
    if (title.toLowerCase().includes("date") && value && !isNaN(Date.parse(value))) {
      const d = new Date(value);
      return `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(-2)}`;
    }
    return value;
  };

  /* Filter rows by Employee ID if requested */
  let rows = sheet.rows;
  if (filterByEmpID) {
    rows = rows.filter(r => {
      const idVal = get(r, "Employee ID");
      return idVal && idVal.toString().toUpperCase() === empID;
    });
  }

  // If nothing to show, render a lightweight empty state (if container is a DIV)
  if (rows.length === 0) {
    if (el.tagName.toLowerCase() !== 'table') {
      el.innerHTML = `
        <h2>${title}</h2>
        <div class="empty-state">
          <p>You don’t have any records yet for <strong>${title}</strong>.</p>
        </div>`;
      ensureFooter(el); // still attach footer to the scroll window if present
    } else {
      el.innerHTML = '';
      ensureFooter(el);
    }
    return;
  }

  /* Header label remaps for readability */
  const colHeaderMap = {
    // CI
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
    // Safety
    "submit date": "Date",
    "facility": "Facility",
    "department/area": "Department/Area",
    "safety concern": "Safety Concern",
    "description": "Description",
    "recommendations to correct/improve safety issue": "Recommendations",
    "resolution": "Resolution",
    "maintenance work order number or type na if no w/o": "Work Order",
    "who was the safety concern escalated to": "Escalated To",
    "did you personally speak to the leadership": "Spoke to Leadership",
    "leadership update": "Leadership Update",
    // Quality (labels come through fine, but listed here for clarity)
    "catch id": "Catch ID",
    "entry date": "Entry Date",
    "submitted by": "Submitted By",
    "area": "Area",
    "quality catch": "Quality Catch",
    "part number": "Part Number",
    "description": "Description",
    "status": "Status"
  };

  /* Which columns to show (respect columnOrder if provided) */
  const visibleCols = columnOrder
    ? columnOrder.filter(c => !excludeCols.includes(c))
    : sheet.columns
        .filter(c => !c.hidden && !excludeCols.includes(c.title.trim()))
        .map(c => c.title);

  /* Build <thead> */
  const buildHead = () => {
    let ths = '';
    visibleCols.forEach(c => {
      const key = c.trim().toLowerCase();
      const label = colHeaderMap[key] || c;
      ths += `<th data-col="${key}">${label}</th>`;
    });
    return `<thead><tr>${ths}</tr></thead>`;
  };

  /* Pill badges */
  const pillFrom = (normalized, rawValue) => {
    const v = String(rawValue ?? '').trim();
    if (!v) return '';

    if (normalized === 'ci approval') {
      const cls = ({ approved: 'approved', pending:'pending', denied:'denied', rejected:'denied' }[v.toLowerCase()] || 'pending');
      return `<span class="badge ${cls}">${v}</span>`;
    }

    if (normalized === 'status') {
      // Cross-table mapping so Quality/Safety/CI all render consistently
      const map = {
        'completed':'completed', 'done':'completed',
        'accepted safety concern':'approved', 'accepted':'approved',
        'approved':'approved',
        'denied/cancelled':'denied', 'cancelled':'denied', 'denied':'denied', 'rejected':'denied',
        'needs researched':'pending', 'needs research':'pending', 'needs review':'pending',
        'in progress':'pending', 'open':'pending', 'not started':'pending', 'pending':'pending'
      };
      const cls = map[v.toLowerCase()] || 'pending';
      return `<span class="badge ${cls}">${v}</span>`;
    }

    return null;
  };

  const isCheckCol = (name) => checkmarkCols.map(s => s.toLowerCase()).includes(name);

  /* Build <tbody> */
  const buildBody = () => {
    let rowsHtml = '';
    rows.forEach(r => {
      let tds = '';
      visibleCols.forEach(title => {
        const raw = get(r, title);
        const key  = title.trim().toLowerCase();

        // Checkmarks for boolean-ish columns
        let content = raw;
        if (isCheckCol(key)) {
          if (raw === true || raw === '✓') content = `<span class="checkmark">&#10003;</span>`;
          else if (raw === false || raw === '✗' || raw === 'X') content = `<span class="cross">&#10007;</span>`;
        }

        // Pill badges
        const pill = pillFrom(key, raw);
        if (pill) content = pill;

        const safeTitle = (typeof raw === 'string')
          ? raw.replace(/"/g,'&quot;')
          : String(raw ?? '');

        tds += `<td data-col="${key}" title="${safeTitle}">
                  <div class="cell">${content ?? ''}</div>
                </td>`;
      });
      rowsHtml += `<tr>${tds}</tr>`;
    });
    return `<tbody class="dashboard-table-body">${rowsHtml}</tbody>`;
  };

  /* Render into either a <table> or a <div> */
  const isTableEl = el.tagName.toLowerCase() === 'table';
  if (isTableEl) {
    el.classList.add('dashboard-table');
    el.innerHTML = buildHead() + buildBody();
    ensureFooter(el);       // << attach sticky footer to the .table-scroll wrapper
  } else {
    const html = `<table class="dashboard-table">${buildHead()}${buildBody()}</table>`;
    el.innerHTML = html;
    ensureFooter(el);       // << attach sticky footer to this element if it's the scroll window, or to its wrapper
  }
}

/* --- Helper: append a sticky footer INSIDE the nearest `.table-scroll` wrapper --- */
function ensureFooter(targetEl) {
  // Find the scroll window to receive the footer
  const scrollWin =
    (targetEl.closest && targetEl.closest('.table-scroll')) ||
    (targetEl.classList && targetEl.classList.contains('table-scroll') ? targetEl : null);

  if (!scrollWin) return;

  // Prevent duplicates if renderTable runs again
  if (scrollWin.querySelector('.table-window-footer')) return;

  const footer = document.createElement('div');
  footer.className = 'table-window-footer';
  footer.textContent = 'End of results';
  scrollWin.appendChild(footer);
}
