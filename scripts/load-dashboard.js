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
    section.innerHTML = ""; // clear any previous content

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
    // CI Submissions
    const ci = await fetchSource(sources.ci);
    const ciMap = getColMap(ci.columns);
    const ciRows = ci.rows.filter(r => getVal(r, ciMap, 'Employee ID').toUpperCase() === empID);
    renderTable(ciRows, ciMap, ['Submission Date', 'CI Title', 'Category', 'Status'], 'ciSection');

    // Safety Concerns
    const safety = await fetchSource(sources.safety);
    const safetyMap = getColMap(safety.columns);
    const safetyRows = safety.rows.filter(r => getVal(r, safetyMap, 'Employee ID').toUpperCase() === empID);
    renderTable(safetyRows, safetyMap, ['Submission Date', 'Concern Description', 'Category', 'Status'], 'safetySection');

    // Quality Catches
    const qc = await fetchSource(sources.quality);
    const qcMap = getColMap(qc.columns);
    const qcRows = qc.rows.filter(r => getVal(r, qcMap, 'Employee ID').toUpperCase() === empID);
    renderTable(qcRows, qcMap, ['Submission Date', 'Issue Description', 'Category', 'Status'], 'qcSection');

    // Power Hours (Completed)
    const ph = await fetchSource(sources.power);
    const phMap = getColMap(ph.columns);
    const phRows = ph.rows.filter(r => getVal(r, phMap, 'Employee ID').toUpperCase() === empID && getVal(r, phMap, 'Completed') === true);
    const phCount = phRows.reduce((sum, r) => sum + Number(getVal(r, phMap, 'Completed Hours') || 0), 0);
    const progressPct = Math.min((phCount / 8) * 100, 100).toFixed(1);
    document.getElementById('phProgress').textContent = `${phCount} / 8`;
    document.getElementById('progressBar').style.width = `${progressPct}%`;

    // Level Tracker: Level, Tokens, Month, Pill Summary
    const level = await fetchSource(sources.level);
    const lvlMap = getColMap(level.columns);
    const lvlRows = level.rows.filter(r => getVal(r, lvlMap, 'Employee ID').toUpperCase() === empID);
    lvlRows.sort((a, b) => new Date(getVal(b, lvlMap, 'Month Key')) - new Date(getVal(a, lvlMap, 'Month Key')));

    if (lvlRows.length > 0) {
      const recent = lvlRows[0];
      document.getElementById('userLevel').textContent = getVal(recent, lvlMap, 'Level') || 'N/A';

      const month = getVal(recent, lvlMap, 'Month Key');
      if (month) {
        document.getElementById('currentMonth').textContent = new Date(month).toLocaleString('default', { month: 'long', year: 'numeric' });
      }

      const tokenTotal = getVal(recent, lvlMap, 'Total Tokens Earned') || 0;
      document.getElementById('tokenTotal').textContent = tokenTotal;

      const pillArea = document.getElementById('pillSummary');
      ['Meets L1', 'Meets L2', 'Meets L3'].forEach((lvl) => {
        const pill = document.createElement('div');
        pill.className = 'pill ' + (getVal(recent, lvlMap, lvl) === true ? 'green' : 'red');
        pill.textContent = lvl;
        pillArea.appendChild(pill);
      });
    }
  } catch (err) {
    console.error("Dashboard load error:", err);
  }
});
