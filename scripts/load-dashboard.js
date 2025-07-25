// /scripts/load-dashboard.js
import { renderTable } from '/scripts/table.js';
import { SHEET_IDS, fetchSheet } from './api.js';

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

    // ✅ Render CI Submissions
    renderTable({
      sheet: ci,
      containerId: "ciContent",
      title: "CI Submissions",
      checkmarkCols: ["Resourced", "Paid", "Project Work Completed"],
      excludeCols: ["Submitted By", "Valid Row", "Employee ID"]
    });

    // 💰 Calculate Tokens Earned from CI
    const tokenCol = ci.columns.find(c => c.title.trim().toLowerCase() === "token payout");
    const empCol = ci.columns.find(c => c.title.trim().toLowerCase() === "employee id");
    let totalTokens = 0;

    ci.rows.forEach(row => {
      const empCell = row.cells.find(c => c.columnId === empCol?.id);
      const tokenCell = row.cells.find(c => c.columnId === tokenCol?.id);
      const matchesEmp = empCell?.value?.toString().toUpperCase() === empID;
      const tokenVal = parseFloat(tokenCell?.value || 0);
      if (matchesEmp && !isNaN(tokenVal)) {
        totalTokens += tokenVal;
      }
    });

    const tokenDisplay = document.getElementById("tokenTotal");
    if (tokenDisplay) tokenDisplay.textContent = totalTokens.toFixed(0);

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

// 🧮 Calculate Power Hours Progress using dynamic goal ranges
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

  // ⏳ Fetch goal ranges from Power Hour Targets sheet
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

  // 🧠 Calculate display logic
  const percent = Math.min((totalHours / minTarget) * 100, 100);
  const barEl = document.getElementById("progressBar");
  const phEl = document.getElementById("phProgress");
  const tipsEl = document.getElementById("powerTips");

  barEl.style.width = `${percent}%`;
  phEl.textContent = `${totalHours.toFixed(1)} / ${minTarget}`;

  // 🎨 Bar color logic
  barEl.style.backgroundColor =
    totalHours >= minTarget && totalHours <= maxTarget
      ? "#4ade80" // green
      : totalHours > maxTarget
        ? "#facc15" // yellow (overachiever)
        : "#60a5fa"; // blue (in progress)

  // 💡 Tips logic
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

// ✅ Export
export { loadDashboard };
