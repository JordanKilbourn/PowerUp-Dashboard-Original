// /scripts/load-dashboard.js

function loadDashboard() {
  const empID = sessionStorage.getItem("empID");
  if (!empID) return;

  // Sheet and report IDs
  const levelSheet = '8346763116105604';        // Level Tracker (sheet)
  const hoursSheet = '1240392906264452';        // Power Hours (sheet)
  const ciSheet = '7397205473185668';           // ✅ CI Submission Mirror (sheet)
  const safetySheet = '4089265651666820';        // Safety Concerns (report)
  const qcSheet = '1431258165890948';            // Quality Catches (report)

  const proxy = 'https://powerup-proxy.onrender.com';

  const loadSheet = (id, type = 'sheet') =>
    fetch(`${proxy}/${type}/${id}`).then(res => res.json());

  Promise.all([
    loadSheet(levelSheet),
    loadSheet(hoursSheet),
    loadSheet(ciSheet, 'sheet'),
    loadSheet(safetySheet, 'report'),
    loadSheet(qcSheet, 'report')
  ])
    .then(([level, hours, ci, safety, qc]) => {
      updateLevelInfo(level);
      updatePowerHours(hours);
renderTable(ci, "ciContent", "CI Submissions");
renderTable(safety, "safetyContent", "Safety Concerns");
renderTable(qc, "qcContent", "Quality Catches");
    })
    .catch(err => {
      console.error("Failed to load dashboard data:", err);
    });
}

// 🧠 Update header info + session from level data
function updateLevelInfo(sheet) {
  const empID = sessionStorage.getItem("empID");
  const rows = sheet.rows.filter(r => r.cells.some(c =>
    c.value?.toString().toUpperCase() === empID
  ));

  if (rows.length === 0) return;

  // Grab latest row (sorted by Month Key)
  const latest = rows.sort((a, b) =>
    new Date(b.cells[0].value) - new Date(a.cells[0].value)
  )[0];

  const get = (title) => {
    const col = sheet.columns.find(c => c.title.trim().toLowerCase() === title.toLowerCase());
    const cell = latest.cells.find(x => x.columnId === col?.id);
    return cell?.displayValue || cell?.value || '';
  };

  const level = get("Level") || "N/A";
  const monthKey = get("Month Key");
  const monthStr = monthKey
    ? new Date(monthKey).toLocaleString("default", { month: "long", year: "numeric" })
    : "Unknown";

  // Store in session + update UI
  sessionStorage.setItem("currentLevel", level);
  sessionStorage.setItem("currentMonth", monthStr);

  const levelEl = document.getElementById("userLevel");
  const monthEl = document.getElementById("currentMonth");
  if (levelEl) levelEl.textContent = level;
  if (monthEl) monthEl.textContent = monthStr;
}

// 🧮 Calculate progress from Power Hours
function updatePowerHours(sheet) {
  const empID = sessionStorage.getItem("empID");
  const rows = sheet.rows.filter(r => r.cells.some(c =>
    c.value?.toString().toUpperCase() === empID
  ));

  let totalHours = 0;
  for (const row of rows) {
    const cell = row.cells.find(c => c.value && typeof c.value === 'number');
    if (cell?.value) totalHours += cell.value;
  }

  const phEl = document.getElementById("phProgress");
  const barEl = document.getElementById("progressBar");
  const tipsEl = document.getElementById("powerTips");

  phEl.textContent = `${totalHours.toFixed(1)} / 8`;
  barEl.style.width = `${Math.min((totalHours / 8) * 100, 100)}%`;

  if (totalHours >= 8) {
    tipsEl.textContent = "Target met! Great job!";
  } else {
    const remaining = (8 - totalHours).toFixed(1);
    tipsEl.textContent = `You're ${remaining} hour(s) away from your monthly goal.`;
  }

  // Save to session if needed by other pages
  sessionStorage.setItem("powerHours", totalHours.toFixed(1));
}

// 🧾 Basic table rendering logic
function renderTable(sheet, containerId, title) {
  const empID = sessionStorage.getItem("empID");
  const container = document.getElementById(containerId);
  if (!container) return;

  const colMap = {};
  sheet.columns.forEach(c => colMap[c.title.trim().toLowerCase()] = c.id);

  const get = (row, title) => {
    const colId = colMap[title.toLowerCase()];
    const cell = row.cells.find(c => c.columnId === colId);
    return cell?.displayValue || cell?.value || '';
  };

  const rows = sheet.rows.filter(r => {
    const idVal = get(r, "Employee ID");
    return idVal && idVal.toString().toUpperCase() === empID;
  });

  if (rows.length === 0) {
    container.innerHTML = `<h2>${title}</h2><p>No records found.</p>`;
    return;
  }

  const checkboxCols = ["Resourced", "Paid", "Project Work Completed"];
  const excludeCols = ["Submitted By", "Valid Row", "Employee ID"];
  const visibleCols = sheet.columns.filter(c =>
    !c.hidden && !excludeCols.includes(c.title.trim())
  );

  let html = `<table class="dashboard-table">
    <thead>
      <tr>`;
  visibleCols.forEach(c => {
    html += `<th>${c.title}</th>`;
  });
  html += `</tr>
    </thead>
    <tbody class="dashboard-table-body">`;

  rows.forEach(r => {
    html += "<tr>";
    visibleCols.forEach(c => {
      const cell = r.cells.find(x => x.columnId === c.id);
      const val = cell?.displayValue || cell?.value || "";

      const colName = c.title.trim().toLowerCase();
      const isCheckbox = checkboxCols.map(x => x.toLowerCase()).includes(colName);
      const icon = isCheckbox
        ? val === true
          ? `<span class="checkmark">&#10003;</span>`
          : val === false
            ? `<span class="cross">&#10007;</span>`
            : ""
        : val;

      html += `<td title="${val}">${icon}</td>`;
    });
    html += "</tr>";
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}


