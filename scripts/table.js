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

  if (rows.length === 0) {
    // Render a tiny empty state if the container is a DIV, otherwise clear table
    if (el.tagName.toLowerCase() !== 'table') {
      el.innerHTML = `
        <h2>${title}</h2>
        <div class="empty-state">
          <p>You don’t have any records yet for <strong>${title}</strong>.</p>
        </div>`;
    } else {
      el.innerHTML = '';
    }
    return;
  }

  /* Labels to show in headers */
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
    // Safety (friendly)
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
    "leadership update": "Leadership Update"
  };

  /* Which columns to show */
  const visibleCols = columnOrder
    ? columnOrder.filter(c => !excludeCols.includes(c))
    : sheet.columns
        .filter(c => !c.hidden && !excludeCols.includes(c.title.trim()))
        .map(c => c.title);

  /* If target is a <table>, write thead/tbody directly; if it's a DIV, build a table */
  const isTableEl = el.tagName.toLowerCase() === 'table';
  let html = '';

  const buildHead = () => {
    let ths = '';
    visibleCols.forEach(c => {
      const key = c.trim().toLowerCase();
      const label = colHeaderMap[key] || c;
      ths += `<th data-col="${key}">${label}</th>`;
    });
    return `<thead><tr>${ths}</tr></thead>`;
  };

  /* Pill helper (Status / CI Approval) */
  const pillFrom = (normalized, rawValue) => {
    const vRaw = String(rawValue ?? '').trim();
    if (!vRaw) return null;

    const v = vRaw.toLowerCase();

    if (normalized === 'ci approval') {
      const cls = (
        { approved: 'approved', pending:'pending', denied:'denied', rejected:'denied' }[v] || 'pending'
      );
      return `<span class="badge ${cls}">${vRaw}</span>`;
    }

    if (normalized === 'status') {
      // Cross-table normalization
      const map = {
        // common
        'approved':'approved',
        'completed':'completed',
        'done':'completed',
        'denied':'denied',
        'rejected':'denied',
        'cancelled':'denied',
        'denied/cancelled':'denied',
        'pending':'pending',
        'in progress':'pending',
        'needs review':'pending',
        'needs researched':'pending',
        'not started':'pending',
        // safety variants
        'accepted safety concern':'approved',
        'accepted':'approved',
        // quality variants
        'open':'pending',
        'closed':'completed'
      };
      const cls = map[v];
      if (cls) return `<span class="badge ${cls}">${vRaw}</span>`;
      // If we have some text but no mapping, show the raw text (no pill)
      return vRaw;
    }

    return null;
  };

  const isCheckCol = (name) => checkmarkCols.map(s => s.toLowerCase()).includes(name);

  const escapeTitle = (val) =>
    typeof val === 'string' ? val.replace(/"/g, '&quot;') : String(val ?? '');

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
          if (raw === true || raw === '✓') {
            content = `<span class="checkmark">&#10003;</span>`;
          } else if (raw === false || raw === '✗' || raw === 'X' || raw === 'x') {
            content = `<span class="cross">&#10007;</span>`;
          }
        }

        // Pill badges
        const pill = pillFrom(key, raw);
        if (pill !== null) content = pill;
        // If status was empty, present a readable dash instead of nothing
        if (key === 'status' && (content === '' || content == null)) content = '—';

        // Wrap everything in a .cell for CSS clamping; short fields are no-wrapped by CSS
        tds += `<td data-col="${key}" title="${escapeTitle(raw)}">
                  <div class="cell">${content ?? ''}</div>
                </td>`;
      });
      rowsHtml += `<tr>${tds}</tr>`;
    });
    return `<tbody class="dashboard-table-body">${rowsHtml}</tbody>`;
  };

  if (isTableEl) {
    el.classList.add('dashboard-table');
    el.innerHTML = buildHead() + buildBody();
  } else {
    html = `<table class="dashboard-table">${buildHead()}${buildBody()}</table>`;
    el.innerHTML = html;
  }
}
