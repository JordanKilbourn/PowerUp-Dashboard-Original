// /scripts/table.js

/**
 * Renders a table into containerId.
 * - Keeps your existing pill/nowrap/clamp behavior.
 * - Automatically wraps the table in a fixed-height "frame" that
 *   scrolls internally (so the page chrome stays put).
 * - Shows a small footer area inside the frame so the bottom is always visible.
 */

export function renderTable({
  sheet,
  containerId,
  title = '',
  filterByEmpID = true,
  checkmarkCols = [],
  excludeCols = [],
  columnOrder = null,
  frameHeight = 560   // <- height of the scroll window (px). Match your screenshot.
}) {
  const empID = sessionStorage.getItem("empID");
  const host = document.getElementById(containerId);
  if (!sheet || !host) return;

  // ---- 0) Build title -> columnId map
  const colMap = {};
  sheet.columns.forEach(c => {
    colMap[c.title.trim().toLowerCase()] = c.id;
  });

  const get = (row, title) => {
    const colId = colMap[title.toLowerCase()];
    const cell = row.cells.find(c => c.columnId === colId);
    const value = cell?.displayValue ?? cell?.value ?? '';

    // short dates for anything that looks like a date column
    if (title.toLowerCase().includes("date") && value && !isNaN(Date.parse(value))) {
      const d = new Date(value);
      return `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(-2)}`;
    }
    return value;
  };

  // ---- 1) Filter by Employee ID (optional)
  let rows = sheet.rows;
  if (filterByEmpID) {
    rows = rows.filter(r => {
      const idVal = get(r, "Employee ID");
      return idVal && idVal.toString().toUpperCase() === empID;
    });
  }

  // ---- 2) Early empty state
  if (rows.length === 0) {
    host.innerHTML = `
      <div class="table-frame">
        <div class="table-header-row">
          <h3>${title}</h3>
        </div>
        <div class="table-window" style="--table-window-h:${frameHeight}px">
          <div class="empty-state"><p>No records yet.</p></div>
        </div>
        <div class="table-footer"></div>
      </div>`;
    return;
  }

  // ---- 3) Friendly header labels
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
    "submit date": "Submit Date",
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
    // Quality
    "catch id": "Catch ID",
    "entry date": "Entry Date",
    "submitted by": "Submitted By",
    "area": "Area",
    "quality catch": "Quality Catch",
    "part number": "Part Number"
  };

  // ---- 4) Which columns to render
  const visibleCols = columnOrder
    ? columnOrder.filter(c => !excludeCols.includes(c))
    : sheet.columns
        .filter(c => !c.hidden && !excludeCols.includes(c.title.trim()))
        .map(c => c.title);

  // ---- 5) Badge pills
  const pillFrom = (normalized, rawValue) => {
    const v = String(rawValue ?? '').trim();
    if (!v) return '';

    if (normalized === 'ci approval') {
      const cls = ({ approved: 'approved', pending:'pending', denied:'denied', rejected:'denied' }[v.toLowerCase()] || 'pending');
      return `<span class="badge ${cls}">${v}</span>`;
    }

    if (normalized === 'status') {
      const map = {
        'completed':'completed', 'done':'completed',
        'accepted safety concern':'approved',
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

  // ---- 6) Build THEAD
  const buildHead = () => {
    let ths = '';
    visibleCols.forEach(c => {
      const key = c.trim().toLowerCase();
      const label = colHeaderMap[key] || c;
      ths += `<th data-col="${key}">${label}</th>`;
    });
    return `<thead><tr>${ths}</tr></thead>`;
  };

  // ---- 7) Build TBODY
  const buildBody = () => {
    let rowsHtml = '';
    rows.forEach(r => {
      let tds = '';
      visibleCols.forEach(title => {
        const raw = get(r, title);
        const key  = title.trim().toLowerCase();

        // checkmark columns
        let content = raw;
        if (isCheckCol(key)) {
          if (raw === true || raw === '✓')        content = `<span class="checkmark">&#10003;</span>`;
          else if (raw === false || raw === '✗' || raw === 'X') content = `<span class="cross">&#10007;</span>`;
        }

        // pills
        const pill = pillFrom(key, raw);
        if (pill) content = pill;

        // wrap cell for clamp/nowrap rules in CSS
        const safeTitle = typeof raw === 'string' ? raw.replace(/"/g,'&quot;') : raw;
        tds += `<td data-col="${key}" title="${safeTitle ?? ''}">
                  <div class="cell">${content ?? ''}</div>
                </td>`;
      });
      rowsHtml += `<tr>${tds}</tr>`;
    });
    return `<tbody class="dashboard-table-body">${rowsHtml}</tbody>`;
  };

  // ---- 8) Ensure we have a frame that scrolls internally
  // Structure we want inside host:
  // <div class="table-frame">
  //   (your filter/add/expand controls are *outside*, already present)
  //   <div class="table-window" style="--table-window-h:560px">
  //     <table class="dashboard-table"> ... </table>
  //   </div>
  //   <div class="table-footer">End of results</div>
  // </div>

  // Wipe and rebuild the frame fresh each render
  const frame = document.createElement('div');
  frame.className = 'table-frame';

  const windowDiv = document.createElement('div');
  windowDiv.className = 'table-window';
  windowDiv.style.setProperty('--table-window-h', `${frameHeight}px`);

  const footer = document.createElement('div');
  footer.className = 'table-footer';
  footer.innerHTML = `<span class="end-text">End of results</span>`;

  const tableHTML = `<table class="dashboard-table">${buildHead()}${buildBody()}</table>`;
  windowDiv.innerHTML = tableHTML;

  frame.appendChild(windowDiv);
  frame.appendChild(footer);

  host.innerHTML = '';
  host.appendChild(frame);
}
