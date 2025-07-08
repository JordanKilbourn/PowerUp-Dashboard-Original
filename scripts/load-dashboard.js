document.addEventListener("DOMContentLoaded", async () => {
  const empID = sessionStorage.getItem('empID');
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
    power: { id: '1240392906264452', type: 'sheet' }
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
    const cell = row.cells.find(c => c.columnId === colMap[title.toLowerCase()]);
    return cell ? (cell.displayValue || cell.value || '') : '';
  };

  const renderTable = (rows, colMap, fields, sectionId) => {
    const section = document.getElementById(sectionId);
    section.innerHTML = "";

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    fields.forEach(f => {
      const th = document.createElement("th");
      th.textContent = f;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    rows.forEach(r => {
      const tr = document.createElement("tr");
      fields.forEach(f => {
        const td = document.createElement("td");
        const val = getVal(r, colMap, f);
        td.textContent = val;
        td.title = val;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    const title = document.createElement("h2");
    title.innerHTML = {
      ciSection: '<i class="fas fa-lightbulb"></i> CI Submissions',
      safetySection: '<i class="fas fa-hard-hat"></i> Safety Concerns',
      qcSection: '<i class="fas fa-bug"></i> Quality Catches'
    }[sectionId];
    section.appendChild(title);
    section.appendChild(table);
  };

  try {
    // Fetch submissions
    const [ci, safety, qc, level, power] = await Promise.all([
      fetchSource(sources.ci),
      fetchSource(sources.safety),
      fetchSource(sources.quality),
      fetchSource(sources.level),
      fetchSource(sources.power)
    ]);

    const ciMap = getColMap(ci.columns);
    const safetyMap = getColMap(safety.columns);
    const qcMap = getColMap(qc.columns);
    const lvlMap = getColMap(level.columns);
    const phMap = getColMap(power.columns);

    const ciRows = ci.rows.filter(r => getVal(r, ciMap, 'Employee ID').toUpperCase() === empID);
    const safetyRows = safety.rows.filter(r => getVal(r, safetyMap, 'Employee ID').toUpperCase() === empID);
    const qcRows = qc.rows.filter(r => getVal(r, qcMap, 'Employee ID').toUpperCase() === empID);
    const lvlRows = level.rows.filter(r => getVal(r, lvlMap, 'Employee ID').toUpperCase() === empID);
    const phRows = power.rows.filter(r =>
      getVal(r, phMap, 'Employee ID').toUpperCase() === empID &&
      getVal(r, phMap, 'Completed') === true
    );

    renderTable(ciRows, ciMap, ['Submission Date', 'CI Title', 'Category', 'Status'], 'ciSection');
    renderTable(safetyRows, safetyMap, ['Submission Date', 'Concern Description', 'Category', 'Status'], 'safetySection');
    renderTable(qcRows, qcMap, ['Submission Date', 'Issue Description', 'Category', 'Status'], 'qcSection');

    // Sort level tracker
    lvlRows.sort((a, b) => new Date(getVal(b, lvlMap, 'Month Key')) - new Date(getVal(a, lvlMap, 'Month Key')));
    const latestRow = lvlRows[0] || {};

    const userLevel = (getVal(latestRow, lvlMap, 'Level') || 'L1').toUpperCase();
    const monthKey = getVal(latestRow, lvlMap, 'Month Key');
    const tokenTotal = getVal(latestRow, lvlMap, 'Total Tokens Earned') || 0;

    document.getElementById('userLevel').textContent = userLevel || 'N/A';
    document.getElementById('tokenTotal').textContent = tokenTotal;
    if (monthKey) {
      document.getElementById('currentMonth').textContent = new Date(monthKey).toLocaleString('default', { month: 'long', year: 'numeric' });
    }

    const pillArea = document.getElementById('pillSummary');
    ['Meets L1', 'Meets L2', 'Meets L3'].forEach(lvl => {
      const pill = document.createElement('div');
      pill.className = 'pill ' + (getVal(latestRow, lvlMap, lvl) === true ? 'green' : 'red');
      pill.textContent = lvl;
      pillArea.appendChild(pill);
    });

    // Fetch power hour targets
    const targets = await fetch(`${proxyBase}/sheet/3542697273937796`).then(res => res.json());
    const targetsMap = {};
    const tCols = getColMap(targets.columns);
    targets.rows.forEach(r => {
      const lvl = getVal(r, tCols, 'Level').toUpperCase();
      targetsMap[lvl] = {
        min: Number(getVal(r, tCols, 'Min Hours')) || 0,
        max: Number(getVal(r, tCols, 'Max Hours')) || 0
      };
    });

    const { min: targetMin = 0, max: targetMax = 8 } = targetsMap[userLevel] || {};
    const phCount = phRows.reduce((sum, r) => sum + Number(getVal(r, phMap, 'Completed Hours') || 0), 0);

    const currentDate = new Date();
    const [m, y] = monthKey ? monthKey.split('/') : [currentDate.getMonth() + 1, currentDate.getFullYear()];
    const start = new Date(`${m}/01/${y}`);
    const end = new Date(start);
    end.setMonth(start.getMonth() + 1);
    end.setDate(0);
    const daysLeft = Math.max((end - currentDate) / (1000 * 60 * 60 * 24), 0).toFixed(0);

    const pct = targetMax > 0 ? ((phCount / targetMax) * 100).toFixed(1) : 0;
    document.getElementById('phProgress').textContent = `${phCount} / ${targetMax}`;
    const bar = document.getElementById('progressBar');
    bar.style.width = `${pct}%`;
    bar.style.backgroundColor =
      phCount >= targetMax ? '#22c55e' :
      phCount >= targetMin ? '#facc15' :
      '#f87171';

    const smartMsg = document.getElementById('powerTips');
    if (smartMsg) {
      if (phCount >= targetMax) {
        smartMsg.textContent = `✅ You've exceeded your target! Keep it up.`;
      } else if (phCount >= targetMin) {
        smartMsg.textContent = `✅ Target met! Great job.`;
      } else {
        const remaining = (targetMin - phCount).toFixed(1);
        smartMsg.textContent = `⏳ You need ${remaining} more hours this month. ${daysLeft} days left!`;
      }
    }

  } catch (err) {
    console.error("Dashboard load error:", err);
    const tips = document.getElementById('powerTips');
    if (tips) tips.textContent = "⚠️ Unable to load dashboard data. Please try again later.";
  }
});
