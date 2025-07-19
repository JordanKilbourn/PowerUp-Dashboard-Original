import { initializePage } from './layout.js';
import { renderTable } from './table.js';
import './session.js';

document.addEventListener("DOMContentLoaded", async () => {
  await initializePage(); // Loads sidebar + header

  // After layout is injected, safely update header fields
document.getElementById("userGreeting").textContent = sessionStorage.getItem("displayName") || "User";

const currentMonth = sessionStorage.getItem("currentMonth");
if (currentMonth) {
  document.getElementById("currentMonth").textContent = currentMonth;
}

const currentLevel = sessionStorage.getItem("currentLevel");
if (currentLevel) {
  document.getElementById("userLevel").textContent = currentLevel;
}


  const empID = sessionStorage.getItem("empID");
  if (!empID) {
    alert("Please log in first.");
    window.location.href = "index.html";
    return;
  }

  try {
    const res = await fetch("https://powerup-proxy.onrender.com/sheet/1240392906264452");
    const sheet = await res.json();

    const matchingRows = sheet.rows.filter(r =>
      r.cells.some(c => c.value?.toString().toUpperCase() === empID)
    );

    let totalHours = 0;

    const getCellValue = (row, colTitle) => {
      const col = sheet.columns.find(c => c.title.trim().toLowerCase() === colTitle.toLowerCase());
      const cell = row.cells.find(x => x.columnId === col?.id);
      return cell?.displayValue || cell?.value || '';
    };

    const tableRows = matchingRows.map(row => {
      const phID = getCellValue(row, "Power Hour ID");
      const startTime = getCellValue(row, "Start Time");
      const endTime = getCellValue(row, "End Time");
      const scheduled = getCellValue(row, "Scheduled?");
      const completed = getCellValue(row, "Completed?");
      const activity = getCellValue(row, "Activity Description");
      const date = getCellValue(row, "Date");
      const hours = parseFloat(getCellValue(row, "Completed Hours") || 0);

      totalHours += hours;

      return {
        "Power Hour ID": phID,
        "Date": date,
        "Start Time": startTime,
        "End Time": endTime,
        "Scheduled": scheduled,
        "Completed": completed,
        "Completed Hours": hours,
        "Activity Description": activity
      };
    });

    // Update summary line
    document.getElementById("powerHoursTotal").textContent = `Total Power Hours Logged: ${totalHours}`;

    // Render table
    renderTable({
      rows: tableRows,
      containerId: "powerHoursTableContainer",
      title: "Power Hours Log",
      checkmarkCols: ["Scheduled", "Completed"],
      columnOrder: [
        "Power Hour ID", "Date", "Start Time", "End Time",
        "Scheduled", "Completed", "Completed Hours", "Activity Description"
      ]
    });

  } catch (err) {
    console.error("Failed to load Power Hours data:", err);
  }
});
