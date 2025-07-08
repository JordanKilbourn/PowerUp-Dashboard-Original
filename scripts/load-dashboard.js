document.addEventListener("DOMContentLoaded", async () => {
  const empID = (sessionStorage.getItem('empID') || '').toUpperCase().trim();
  const displayName = sessionStorage.getItem('displayName') || 'User';
  if (!empID) {
    alert("Please log in first.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById('userGreeting').textContent = displayName;

  const sources = {
    ci: { id: '6584024920182660', type: 'report' },
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

  // Build headers using only visible columns, excluding Employee ID
  const visibleHeaders = columns
    .filter(c => c.hidden !== true && c.title.trim().toLowerCase() !== 'employee id')
    .map(c => c.title.trim());

  const table = document.createElement('table');
  const thead = table.createTHead();
  const headerRow = thead.insertRow();

  visibleHeaders.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    headerRow.appendChild(th);
  });

  const tbody = table.createTBody();
  rows.forEach(row => {
    const tr = tbody.insertRow();
    visibleHeaders.forEach(h => {
      const td = tr.insertCell();
      const val = getVal(row, colMap, h);
      td.textContent = val;
      td.title = val;
    });
  });

  section.appendChild(table);
};

  try {
    // --- Load Power Hours
    const ph = await fetchSource(sources.power);
    const phMap = getColMap(ph.columns);
    const phRows = ph.rows.filter(r =>
      getVal(r, phMap, 'Employee ID').toUpperCase() === empID &&
      getVal(r, phMap, 'Completed') === true
    );
    const phCount = phRows.reduce((sum, r) => sum + Number(getVal(r, phMap, 'Completed Hours') || 0), 0);

    // --- Load Level Tracker
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

    // --- Load Power Hour Targets
    const targets = await fetchSource(sources.targets);
    const ptCols = getColMap(targets.columns);
    const targetRow = targets.rows.find(r => getVal(r, ptCols, 'Level').toUpperCase() === userLevel);
    if (targetRow) {
      targetMin = Number(getVal(targetRow, ptCols, 'Min Hours')) || 0;
      targetMax = Number(getVal(targetRow, ptCols, 'Max Hours')) || 0;
    }

    // --- Smart Progress
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

    // --- Dynamic Reports (CI, Safety, QC)
for (const key of ['ci', 'safety', 'quality']) {
  const report = await fetchSource(sources[key]);
  const colMap = getColMap(report.columns);
  const rows = report.rows.filter(r => getVal(r, colMap, 'Employee ID').toUpperCase() === empID);
  renderTable(rows, colMap, `${key}Section`, report.columns); // <-- pass columns
}

  } catch (err) {
    console.error("Dashboard load error:", err);
  }
});
