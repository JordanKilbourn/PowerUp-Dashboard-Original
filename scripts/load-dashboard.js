document.addEventListener("DOMContentLoaded", async () => {
const style = document.createElement('style');
 console.log("[Debug] load-dashboard.js is executing");
 style.textContent = `
  .dashboard-table-container {
    margin-bottom: 24px;
    overflow-x: auto;
  }
  .dashboard-table {
    width: 100%;
    border-collapse: collapse;
    background-color: #1e293b;
    color: white;
    font-size: 14px;
  }
  
.dashboard-table thead th {
  background-color: #0f172a;
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 6px 10px;
  white-space: normal;
  word-break: normal;
  overflow-wrap: break-word;
  max-width: 140px;
  text-align: center;
  font-weight: 600;
  line-height: 1.2;
}
  .dashboard-table tbody {
    display: block;
    max-height: 10.5em; /* ~4 rows tall */
    overflow-y: auto;
  }
  .dashboard-table thead,
  .dashboard-table tbody tr {
    display: table;
    width: 100%;
    table-layout: fixed;
  }
  .dashboard-table td {
    padding: 6px 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: top;
    border: 1px solid #334155;
  }
  .dashboard-table td.wrap {
    white-space: normal;
    word-break: break-word;
    max-width: 600px;
  }
  .dashboard-table td.checkbox,
  .dashboard-table th.checkbox {
    width: 60px;
    text-align: center;
  }
  .dashboard-table tbody::-webkit-scrollbar {
    width: 6px;
  }
  .dashboard-table tbody::-webkit-scrollbar-thumb {
    background-color: #64748b;
    border-radius: 3px;
  }
  .dashboard-table tbody::-webkit-scrollbar-track {
    background: transparent;
  }
`;
  document.head.appendChild(style);

  const empID = (sessionStorage.getItem('empID') || '').toUpperCase().trim();
  const displayName = sessionStorage.getItem('displayName') || 'User';
  if (!empID) {
    alert("Please log in first.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById('userGreeting').textContent = displayName;

  const sources = {
    ci: { id: '7397205473185668', type: 'sheet' }, // ✅ Using CI Submission Mirror
    safety: { id: '4089265651666820', type: 'report' },
    quality: { id: '1431258165890948', type: 'report' },
    level: { id: '8346763116105604', type: 'sheet' },
    power: { id: '1240392906264452', type: 'sheet' },
    targets: { id: '3542697273937796', type: 'sheet' }
  };

  const proxyBase = 'https://powerup-proxy.onrender.com';

  const fetchSource = async ({ id, type }) => {
    const res = await fetch(`${proxyBase}/${type}/${id}`);
    if (!res.ok) throw new Error(`Error loading ${type} ${id}`);
    return await res.json();
  };

  const getColMap = (columns) => {
    const map = {};
    columns.forEach(c => map[c.title.trim().toLowerCase()] = c.id);
    return map;
  };

  const getVal = (row, colMap, title) => {
    const colId = colMap[title.toLowerCase()];
    const cell = row.cells.find(c => c.columnId === colId);
    return cell ? (cell.displayValue || cell.value || '') : '';
  };

const renderTable = (rows, colMap, sectionId, columns) => {
  const section = document.getElementById(sectionId);
  section.innerHTML = "";

  const container = document.createElement('div');
  container.className = 'dashboard-table-container';

  // Exclude unwanted columns
  const excludedCols = ['employee id', 'valid row', 'submitted by'];
  const visibleHeaders = columns
    .filter(c => !c.hidden && !excludedCols.includes(c.title.trim().toLowerCase()))
    .map(c => c.title.trim());

  const table = document.createElement('table');
  table.className = 'dashboard-table';

  // Build thead
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  visibleHeaders.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    if (h.toLowerCase().includes('checkbox') || h.toLowerCase().includes('resourced')) {
      th.classList.add('checkbox');
    }
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  // Build tbody
  const tbody = document.createElement('tbody');
  rows.forEach(row => {
    const tr = document.createElement('tr');
    visibleHeaders.forEach(h => {
      const td = document.createElement('td');
      const val = getVal(row, colMap, h);
      td.textContent = val;
      td.title = val;

      if (h.toLowerCase().includes('problem') || h.toLowerCase().includes('solution')) {
        td.classList.add('wrap');
      }

      if (h.toLowerCase().includes('checkbox') || h.toLowerCase().includes('resourced')) {
        td.classList.add('checkbox');
      }

      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  container.appendChild(table);
  section.appendChild(container);
};
  try {
    // --- Power Hours ---
    const ph = await fetchSource(sources.power);
    const phMap = getColMap(ph.columns);
    const phRows = ph.rows.filter(r =>
      getVal(r, phMap, 'Employee ID').toUpperCase() === empID &&
      getVal(r, phMap, 'Completed').toString().toLowerCase() === 'true'
    );
    const phCount = phRows.reduce((sum, r) => sum + Number(getVal(r, phMap, 'Completed Hours') || 0), 0);

    // --- Level Tracker ---
    const level = await fetchSource(sources.level);
    const lvlMap = getColMap(level.columns);
    const lvlRows = level.rows.filter(r => getVal(r, lvlMap, 'Employee ID').toUpperCase() === empID);
    lvlRows.sort((a, b) => new Date(getVal(b, lvlMap, 'Month Key')) - new Date(getVal(a, lvlMap, 'Month Key')));

    let userLevel = 'L1';
    let targetMin = 0;
    let targetMax = 8;
    let currentMonthKey = '';

    if (lvlRows.length > 0) {
      const recent = lvlRows[0];
      userLevel = (getVal(recent, lvlMap, 'Level') || 'L1').toUpperCase();
      currentMonthKey = getVal(recent, lvlMap, 'Month Key');
      document.getElementById('userLevel').textContent = userLevel;
      const month = getVal(recent, lvlMap, 'Month Key');
      if (month) {
        document.getElementById('currentMonth').textContent = new Date(month).toLocaleString('default', { month: 'long', year: 'numeric' });
      }
      document.getElementById('tokenTotal').textContent = getVal(recent, lvlMap, 'Total Tokens Earned') || 0;
      const pillArea = document.getElementById('pillSummary');
      ['Meets L1', 'Meets L2', 'Meets L3'].forEach((lvl) => {
        const pill = document.createElement('div');
        pill.className = 'pill ' + (getVal(recent, lvlMap, lvl) === true ? 'green' : 'red');
        pill.textContent = lvl;
        pillArea.appendChild(pill);
      });
    }

    // --- Power Hour Targets ---
    const targets = await fetchSource(sources.targets);
    const ptCols = getColMap(targets.columns);
    const targetRow = targets.rows.find(r => getVal(r, ptCols, 'Level').toUpperCase() === userLevel);
    if (targetRow) {
      targetMin = Number(getVal(targetRow, ptCols, 'Min Hours')) || 0;
      targetMax = Number(getVal(targetRow, ptCols, 'Max Hours')) || 0;
    }

    // --- Smart Progress ---
    const currentDate = new Date();
    const [month, year] = currentMonthKey ? currentMonthKey.split('/') : [currentDate.getMonth() + 1, currentDate.getFullYear()];
    const monthStart = new Date(`${month}/01/${year}`);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthStart.getMonth() + 1);
    monthEnd.setDate(0);
    const daysLeft = Math.max((monthEnd - currentDate) / (1000 * 60 * 60 * 24), 0).toFixed(0);

    const pct = targetMax > 0 ? ((phCount / targetMax) * 100).toFixed(1) : 0;
    document.getElementById('phProgress').textContent = `${phCount} / ${targetMax}`;
    const bar = document.getElementById('progressBar');
    bar.style.width = `${pct}%`;
    bar.style.backgroundColor =
      phCount >= targetMax ? '#22c55e' :
      phCount >= targetMin ? '#facc15' : '#f87171';

    const smartMsg = document.getElementById('powerTips');
    if (smartMsg) {
      if (phCount >= targetMax) {
        smartMsg.textContent = `✅ You've exceeded your target! Keep it up.`;
      } else if (phCount >= targetMin) {
        smartMsg.textContent = `✅ Target met! Great job.`;
      } else {
        const hoursRemaining = (targetMin - phCount).toFixed(1);
        smartMsg.textContent = `⏳ You need ${hoursRemaining} more hours this month. ${daysLeft} days left!`;
      }
    }

// --- CI Submissions Table (from CI Mirror Sheet) ---
const ci = await fetchSource(sources.ci);
const ciMap = getColMap(ci.columns);
const ciRows = ci.rows.filter(r =>
  getVal(r, ciMap, 'Employee ID').toUpperCase() === empID &&
  getVal(r, ciMap, 'Valid Row').toLowerCase() === 'yes'
);
renderTable(ciRows, ciMap, 'ciSection', ci.columns);

// --- Safety Concerns Table ---
const safety = await fetchSource(sources.safety);
const safetyMap = getColMap(safety.columns);
const safetyRows = safety.rows.filter(r => getVal(r, safetyMap, 'Employee ID').toUpperCase() === empID);
renderTable(safetyRows, safetyMap, 'safetySection', safety.columns);

// --- Quality Catches Table ---
const qc = await fetchSource(sources.quality);
const qcMap = getColMap(qc.columns);
const qcRows = qc.rows.filter(r => getVal(r, qcMap, 'Employee ID').toUpperCase() === empID);
renderTable(qcRows, qcMap, 'qcSection', qc.columns);
  } catch (err) {
    console.error("Dashboard load error:", err);
  }
});

