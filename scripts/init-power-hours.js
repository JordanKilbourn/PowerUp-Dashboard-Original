import { initializePage } from './layout.js';
import { renderTable } from './table.js';
import './session.js';

document.addEventListener("DOMContentLoaded", async () => {
  await initializePage();

  document.getElementById("userGreeting").textContent = sessionStorage.getItem("displayName") || "User";
  document.getElementById("currentMonth").textContent = sessionStorage.getItem("currentMonth") || "";
  document.getElementById("userLevel").textContent = sessionStorage.getItem("currentLevel") || "";

  const empID = sessionStorage.getItem("empID");
  if (!empID) {
    alert("Please log in first.");
    window.location.href = "index.html";
    return;
  }

  try {
    const res = await fetch("https://powerup-proxy.onrender.com/sheet/1240392906264452");
    const sheet = await res.json();

    const matchingRows = sheet.rows.filter(row =>
      row.cells.some(cell => String(cell.value).trim().toUpperCase() === empID)
    );

    const getVal = (row, title) => {
      const col = sheet.columns.find(c => c.title.trim().toLowerCase() === title.toLowerCase());
      const cell = row.cells.find(x => x.columnId === col?.id);
      return cell?.displayValue || cell?.value || '';
    };

    let totalHours = 0;
    matchingRows.forEach(row => {
      const val = parseFloat(getVal(row, "Completed Hours") || 0);
      if (!isNaN(val)) totalHours += val;
    });

    document.getElementById("powerHoursTotal").textContent = `Total Power Hours Logged: ${totalHours.toFixed(2)}`;

    renderTable({
      sheet: { columns: sheet.columns, rows: matchingRows },
      containerId: "powerHoursTableContainer",
      title: "Power Hours Log",
      excludeCols: ["Employee ID"],
      checkmarkCols: ["Scheduled?", "Completed?"],
      filterByEmpID: false
    });

  } catch (err) {
    console.error("Failed to load Power Hours data:", err);
  }
});
