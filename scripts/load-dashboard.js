import { renderTable } from '/scripts/table.js';
import { SHEET_IDS, fetchSheet } from './api.js';


// Filter a Smartsheet-like "sheet" object by Status (case-insensitive).
function filterSheetByStatus(sheet, selected) {
  if (!sheet || !Array.isArray(sheet.rows) || !selected || selected === 'all') return sheet;
  const statusCol = sheet.columns.find(c => c.title && c.title.trim().toLowerCase() === 'status');
  if (!statusCol) return sheet;
  const rows = sheet.rows.filter(row => {
    const cell = row.cells.find(c => c.columnId === statusCol.id);
    const val = (cell?.displayValue ?? cell?.value ?? '').toString().trim().toLowerCase();
    return val === selected.toLowerCase();
  });
  return { ...sheet, rows };
}

function loadDashboard() {
  const empID = sessionStorage.getItem("empID");
  if (!empID) return;

  Promise.all([
    fetchSheet(SHEET_IDS.levelTracker),
    fetchSheet(SHEET_IDS.powerHours),
    fetchSheet(SHEET_IDS.ciSubmissions),
    fetchSheet(SHEET_IDS.safetyConcerns),
    fetchSheet(SHEET_IDS.qualityCatches)
  ])
  .then(([level, hours, ci, safety, qc]) => {
    updateLevelInfo(level);
    updatePowerHours(hours);

    // ✅ CI Submissions
    const renderCI = () => {
  const selected = document.getElementById('ciStatusFilter')?.value || 'all';
  const ciFiltered = filterSheetByStatus(ci, selected);
  const renderSafety = () => {
  const selected = document.getElementById('safetyStatusFilter')?.value || 'all';
  const safetyFiltered = filterSheetByStatus(safety, selected);
  const renderQuality = () => {
  const selected = document.getElementById('qcStatusFilter')?.value || 'all';
  const qcFiltered = filterSheetByStatus(qc, selected);
  renderTable({
    sheet: qcFiltered,
    containerId: "qcTable",
    title: "Quality Catches",
    excludeCols: ["Employee ID"]
  });
  const qCount = document.getElementById('qcSubmissionCount');
  if (qCount) qCount.textContent = `${qcFiltered.rows.length} submissions`;
};
renderQuality();
document.getElementById('ciStatusFilter')?.addEventListener('change', renderCI);
document.getElementById('safetyStatusFilter')?.addEventListener('change', renderSafety);
document.getElementById('qcStatusFilter')?.addEventListener('change', renderQuality);
})
  .catch(err => {
    console.error("Failed to load dashboard data:", err);
  });
}

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

async function updatePowerHours(sheet) {
  const empID = sessionStorage.getItem("empID");
  const currentLevel = sessionStorage.getItem("currentLevel") || "N/A";

  const rows = sheet.rows.filter(r =>
    r.cells.some(c => c.value?.toString().toUpperCase() === empID)
  );

  let totalHours = 0;

  for (const row of rows) {
    const completedCol = sheet.columns.find(c => c.title.trim().toLowerCase() === "completed");
    const hoursCol = sheet.columns.find(c => c.title.trim().toLowerCase() === "completed hours");

    const isCompleted = row.cells.find(c => c.columnId === completedCol?.id)?.value === true;
    const completedVal = row.cells.find(c => c.columnId === hoursCol?.id)?.value;

    if (isCompleted && typeof completedVal === "number") {
      totalHours += completedVal;
    }
  }

  let minTarget = 8;
  let maxTarget = 12;

  try {
    const targetsRes = await fetch("https://powerup-proxy.onrender.com/sheet/3542697273937796");
    const targetsData = await targetsRes.json();

    const levelRow = targetsData.rows.find(r =>
      r.cells.some(c => c.displayValue?.toString().toLowerCase() === currentLevel.toLowerCase())
    );

    if (levelRow) {
      const get = (title) => {
        const col = targetsData.columns.find(c => c.title.trim().toLowerCase() === title.toLowerCase());
        const cell = levelRow.cells.find(x => x.columnId === col?.id);
        return parseFloat(cell?.displayValue || cell?.value || '');
      };

      minTarget = get("Min Hours") || minTarget;
      maxTarget = get("Max Hours") || maxTarget;
    }
  } catch (err) {
    console.warn("Power Hour Targets not loaded, using default range.");
  }

  const percent = Math.min((totalHours / minTarget) * 100, 100);
  const barEl = document.getElementById("progressBar");
  const phEl = document.getElementById("phProgress");
  const tipsEl = document.getElementById("powerTips");

  barEl.style.width = `${percent}%`;
  phEl.textContent = `${totalHours.toFixed(1)} / ${minTarget}`;

  barEl.style.backgroundColor =
    totalHours >= minTarget && totalHours <= maxTarget
      ? "#4ade80"
      : totalHours > maxTarget
        ? "#facc15"
        : "#60a5fa";

  if (totalHours >= minTarget && totalHours <= maxTarget) {
    tipsEl.textContent = "✅ Target met! Great job!";
  } else if (totalHours > maxTarget) {
    tipsEl.textContent = "🎉 You've gone above and beyond!";
  } else {
    const now = new Date();
    const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
    const remaining = (minTarget - totalHours).toFixed(1);
    tipsEl.textContent = `You're ${remaining} hour(s) away from your goal. ${daysLeft} day(s) left this month.`;
  }

  sessionStorage.setItem("powerHours", totalHours.toFixed(1));
}

export { loadDashboard };
