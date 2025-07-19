import { initializePage } from './layout.js';
import { renderTable } from './table.js';
import './session.js';

document.addEventListener("DOMContentLoaded", async () => {
  await initializePage(); // Loads sidebar + header

  // ✅ Safely update header fields after layout injection
  document.getElementById("userGreeting").textContent = sessionStorage.getItem("displayName") || "User";

  const currentMonth = sessionStorage.getItem("currentMonth");
  if (currentMonth) {
    document.getElementById("currentMonth").textContent = currentMonth;
  }

  const currentLevel = sessionStorage.getItem("currentLevel");
  if (currentLevel) {
    document.getElementById("userLevel").textContent = currentLevel;
  }

  // ✅ Get logged-in employee ID
  const empID = sessionStorage.getItem("empID");
  if (!empID) {
    alert("Please log in first.");
    window.location.href = "index.html";
    return;
  }

  try {
    // ✅ Fetch the full Power Hours sheet
    const res = await fetch("https://powerup-proxy.onrender.com/sheet/1240392906264452");
    const sheet = await res.json();

    // ✅ Filter rows for current user
    const matchingRows = sheet.rows.filter(row =>
      row.cells.some(cell => String(cell.value).trim().toUpperCase() === empID)
    );

    // ✅ Optional: calculate total completed hours
    const getVal = (row, title) => {
      const col = sheet.columns.find(c => c.title.trim().toLowerCase() === title.toLowerCase());
      const cell = row.cells.find(x => x.columnId === col?.id);
      return cell?.displayValue || cell?.value || '';
    };

    let totalHours = 0;
    matchingRows.forEach(row => {
      const raw = getVal(row, "Completed Hours");
      const hours = parseFloat(raw || 0);
      if (!isNaN(hours)) totalHours += hours;
    });

    // ✅ Update summary total line
    document.getElementById("powerHoursTotal").textContent = `Total Power Hours Logged: ${totalHours.toFixed(2)}`;

    // ✅ Render dynamic table using new system
    const filteredSheet = {
      columns: sheet.columns,
      rows: matchingRows
    };

    renderTable({
      sheet: filteredSheet,
      containerId: "powerHoursTableContainer",
      title: "Power Hours Log",
      excludeCols: ["Employee ID"],
      checkmarkCols: ["Scheduled?", "Completed?"],
      filterByEmpID: false
    });

  } catch (err) {
    console.error("Failed to load Power Hours data:", err);
    document.getElementById("powerHoursTableContainer").innerHTML = `<p style="color: red;">Error loading table. Please try again later.</p>`;
  }
});
