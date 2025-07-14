// /scripts/init-power-hours.js
import { SHEET_IDS, fetchSheet } from './api.js';

document.addEventListener("DOMContentLoaded", () => {
  const empID = sessionStorage.getItem("empID");
  if (!empID) {
    alert("Please log in first.");
    window.location.href = "index.html";
    return;
  }

  // 🧠 Load session values into header
  const displayName = sessionStorage.getItem("displayName") || empID;
  const level = sessionStorage.getItem("currentLevel") || "N/A";
  const month = sessionStorage.getItem("currentMonth") || "Unknown";

  const userEl = document.getElementById("userName");
  const levelEl = document.getElementById("userLevel");
  const monthEl = document.getElementById("currentMonth");

  if (userEl) userEl.textContent = displayName;
  if (levelEl) levelEl.textContent = level;
  if (monthEl) monthEl.textContent = month;

  // 🌐 Highlight active nav link
  const path = window.location.pathname.split("/").pop().toLowerCase();
  document.querySelectorAll(".sidebar a[href]").forEach(link => {
    if (link.getAttribute("href").toLowerCase() === path) {
      link.classList.add("active");
    }
  });

  // 🧾 Load power hour table
  const tbody = document.getElementById('powerHoursBody');
  fetchSheet(SHEET_IDS.powerHours)
    .then(sheet => {
      const colMap = Object.fromEntries(
        sheet.columns.map(col => [col.title.trim().toLowerCase(), col.id])
      );

      const getVal = (row, title) => {
        const cell = row.cells.find(c => c.columnId === colMap[title.toLowerCase()]);
        return cell ? (cell.displayValue ?? cell.value ?? '') : '';
      };

      const matchingRows = sheet.rows.filter(r =>
        getVal(r, 'employee id').toString().toUpperCase() === empID
      );

      if (!matchingRows.length) {
        tbody.innerHTML = '<tr><td colspan="8">No Power Hours records found.</td></tr>';
        return;
      }

      let totalHours = 0;
      tbody.innerHTML = ''; // Clear default loader row

      matchingRows.forEach(r => {
        const tr = document.createElement('tr');
        const completedHours = parseFloat(getVal(r, 'completed hours')) || 0;
        totalHours += completedHours;

        const values = [
          getVal(r, 'power hour id'),
          getVal(r, 'date'),
          getVal(r, 'start time'),
          getVal(r, 'end time'),
          getVal(r, 'scheduled') === true ? '✔️' : '❌',
          getVal(r, 'completed') === true ? '✔️' : '❌',
          completedHours,
          getVal(r, 'activity description')
        ];

        values.forEach(val => {
          const td = document.createElement('td');
          td.textContent = val;
          td.title = val;
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });

      const totalText = `Total Power Hours Logged: ${totalHours}`;
      document.getElementById("hoursTally").textContent = totalText;
      sessionStorage.setItem("totalPowerHoursLogged", totalHours);
    })
    .catch(err => {
      console.error("Error loading Power Hours data:", err);
      tbody.innerHTML = '<tr><td colspan="8">Failed to load Power Hours data.</td></tr>';
    });
});
