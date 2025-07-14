// /scripts/load-dashboard.js
import { renderTable } from '/scripts/table.js';

function loadDashboard() {
  const empID = sessionStorage.getItem("empID");
  if (!empID) return;

  const levelSheet = '8346763116105604';        // Level Tracker (sheet)
  const hoursSheet = '1240392906264452';        // Power Hours (sheet)
  const ciSheet = '7397205473185668';           // CI Submission Mirror (sheet)
  const safetySheet = '4089265651666820';       // Safety Concerns (report)
  const qcSheet = '1431258165890948';           // Quality Catches (report)

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

      // ✅ Render CI Submissions
      renderTable({
        sheet: ci,
        containerId: "ciContent",
        title: "CI Submissions",
        checkmarkCols: ["Resourced", "Paid", "Project Work Completed"],
        excludeCols: ["Submitted By", "Valid Row", "Employee ID"]
      });

      // ✅ Render Safety Concerns
      renderTable({
        sheet: safety,
        containerId: "safetyContent",
        title: "Safety Concerns",
        excludeCols: ["Employee ID"]
      });

      // ✅ Render Quality Catches
      renderTable({
        sheet: qc,
        containerId: "qcContent",
        title: "Quality Catches",
        excludeCols: ["Employee ID"]
      });
    })
    .catch(err => {
      console.error("Failed to load dashboard data:", err);
    });
}

// 🧠 Update header info from level data
function updateLevelInfo(sheet) {
  const empID = sessionStorage.getItem("empID");
  const rows = sheet.rows.filter(r => r.cells.some(c =>
    c.value?.toString().toUpperCase() === empID
  ));

  if (rows.length === 0) return;

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

  sessionStorage.setItem("currentLevel", level);
  sessionStorage.setItem("currentMonth", monthStr);

  const levelEl = document.getElementById("userLevel");
  const monthEl = document.getElementById("currentMonth");
  if (levelEl) levelEl.textContent = level;
  if (monthEl) monthEl.textContent = monthStr;
}

// 🧮 Calculate Power Hours Progress
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

  tipsEl.textContent = totalHours >= 8
    ? "Target met! Great job!"
    : `You're ${(8 - totalHours).toFixed(1)} hour(s) away from your monthly goal.`;

  sessionStorage.setItem("powerHours", totalHours.toFixed(1));
}

// ✅ Export if needed
export { loadDashboard };
