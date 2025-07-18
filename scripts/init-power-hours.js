import { initializePage } from './layout.js';
import { renderTable } from './table.js';
import './session.js';

document.addEventListener("DOMContentLoaded", async () => {
  await initializePage();

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
    const transformedRows = matchingRows.map(row => {
      const get = (title) => {
        const col = sheet.columns.find(c => c.title.trim().toLowerCase() === title.toLowerCase());
        const cell = row.cells.find(x => x.columnId === col?.id);
        return cell?.displayValue ?? cell?.value ?? '';
      };

      const completedHours = parseFloat(get("Completed Hours")) || 0;
      totalHours += completedHours;

      return {
        "Power Hour ID": get("Power Hour ID"),
        "Date": get("Date"),
        "Start Time": get("Start Time"),
        "End Time": get("End Time"),
        "Scheduled": get("Scheduled") === true ? "✔️" : "❌",
        "Completed": get("Completed") === true ? "✔️" : "❌",
        "Completed Hours": completedHours,
        "Activity Description": get("Activity Description")
      };
    });

    // Update header tally
    document.getElementById("hoursTally").textContent = `Total Power Hours Logged: ${totalHours}`;
    sessionStorage.setItem("totalPowerHoursLogged", totalHours);

    // Render table
    renderTable({
      rows: transformedRows,
      containerId: "powerHoursTableContainer",
      columnOrder: [
        "Power Hour ID", "Date", "Start Time", "End Time",
        "Scheduled", "Completed", "Completed Hours", "Activity Description"
      ]
    });

  } catch (err) {
    console.error("Failed to load Power Hours data:", err);
    document.getElementById("powerHoursTableContainer").innerHTML = '<p style="color:red;">Failed to load Power Hours data.</p>';
  }
});
