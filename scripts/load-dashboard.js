// /scripts/load-dashboard.js
import { renderTable } from './table.js';
import { SHEET_IDS, fetchSheet, fetchReport } from './api.js';

function loadDashboard() {
  const empID = sessionStorage.getItem("empID");
  if (!empID) return;

  Promise.all([
    fetchSheet(SHEET_IDS.levelTracker),
    fetchSheet(SHEET_IDS.powerHours),
    fetchSheet(SHEET_IDS.ciSubmissions),
    fetchReport(SHEET_IDS.safetyConcerns),
    fetchReport(SHEET_IDS.qualityCatches)
  ])
    .then(([levelSheet, hoursSheet, ciSheet, safetySheet, qcSheet]) => {
      updateLevelInfo(levelSheet);
      updatePowerHours(hoursSheet);

      renderTable({
        sheet: ciSheet,
        containerId: "ciContent",
        title: "CI Submissions",
        checkmarkCols: ["Resourced", "Paid", "Project Work Completed"],
        excludeCols: ["Submitted By", "Valid Row", "Employee ID"]
      });

      renderTable({
        sheet: safetySheet,
        containerId: "safetyContent",
        title: "Safety Concerns",
        excludeCols: ["Employee ID"]
      });

      renderTable({
        sheet: qcSheet,
        containerId: "qcContent",
        title: "Quality Catches",
        excludeCols: ["Employee ID"]
      });
    })
    .catch(err => {
      console.error("🚨 Failed to load dashboard data:", err);
    });
}

// 🧠 Parse latest level record
function updateLevelInfo(sheet) {
  const empID = sessionStorage.getItem("empID");
  const rows = sheet.rows.filter(r =>
    r.cells.some(c => c.value?.toString().toUpperCase() === empID)
  );

  if (rows.length === 0) return;

  const latest = rows.sort((a, b) =>
    new Date(b.cells[0].value) - new Date(a.cells[0].value)
  )[0];

  const getCellValue = (title) => {
    const col = sheet.columns.find(c => c.title.trim().toLowerCase() === title.toLowerCase());
    const cell = latest.cells.find(x => x.columnId === col?.id);
    return cell?.displayValue || cell?.value || '';
  };

  const level = getCellValue("Level") || "N/A";
  const monthKey = getCellValue("Month Key");
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

// 🔢 Total up user's power hours
function updatePowerHours(sheet) {
  const empID = sessionStorage.getItem("empID");
  const rows = sheet.rows.filter(r =>
    r.cells.some(c => c.value?.toString().toUpperCase() === empID)
  );

  const totalHours = rows.reduce((sum, row) => {
    const cell = row.cells.find(c => typeof c.value === 'number');
    return sum + (cell?.value || 0);
  }, 0);

  const phEl = document.getElementById("phProgress");
  const barEl = document.getElementById("progressBar");
  const tipsEl = document.getElementById("powerTips");

  if (phEl) phEl.textContent = `${totalHours.toFixed(1)} / 8`;
  if (barEl) barEl.style.width = `${Math.min((totalHours / 8) * 100, 100)}%`;
  if (tipsEl) {
    tipsEl.textContent = totalHours >= 8
      ? "Target met! Great job!"
      : `You're ${(8 - totalHours).toFixed(1)} hour(s) away from your monthly goal.`;
  }

  sessionStorage.setItem("powerHours", totalHours.toFixed(1));
}

export { loadDashboard };
