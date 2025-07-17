// /scripts/init-level-tracker.js
import { initializePage } from './layout.js';
import './session.js';

document.addEventListener("DOMContentLoaded", async () => {
  await initializePage();
  // You can add page-specific logic here later if needed
});

// /scripts/init-level-tracker.js
import { renderTable } from '/scripts/table.js';
import './session.js';
import { loadComponents } from './include.js';

document.addEventListener("DOMContentLoaded", async () => {
  await loadComponents();

  const empID = sessionStorage.getItem("empID");
  const displayName = sessionStorage.getItem("displayName") || "User";

  if (!empID) {
    alert("Please log in first.");
    window.location.href = "index.html";
    return;
  }

  try {
    const res = await fetch("https://powerup-proxy.onrender.com/sheet/8346763116105604");
    const sheet = await res.json();

    const row = sheet.rows.find(r =>
      r.cells.some(c => c.value?.toString().toUpperCase() === empID)
    );

    if (row) {
      const get = (title) => {
        const col = sheet.columns.find(c => c.title.trim().toLowerCase() === title.toLowerCase());
        const cell = row.cells.find(x => x.columnId === col?.id);
        return cell?.displayValue || cell?.value || '';
      };

      const level = get("Level");
      const monthKey = get("Month Key");

      const levelEl = document.getElementById("userLevel");
      const monthEl = document.getElementById("currentMonth");

      if (levelEl) levelEl.textContent = level;
      if (monthEl && monthKey) {
        monthEl.textContent = new Date(monthKey).toLocaleString("default", { month: "long", year: "numeric" });
      }
    }

    renderTable({
      sheet,
      containerId: "levelTableContainer",
      title: "Monthly Level Tracker",
      checkmarkCols: ["Meets L1", "Meets L2", "Meets L3"],
      columnOrder: [
        "Month Key", "CI Submissions", "Safety Submissions", "Quality Submissions",
        "Total Submissions", "Power Hours Logged",
        "Meets L1", "Meets L2", "Meets L3", "Level"
      ]
    });

  } catch (err) {
    console.error("Failed to load level tracker data:", err);
  }
});

