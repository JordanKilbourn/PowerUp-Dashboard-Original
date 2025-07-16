// /scripts/init-power-hours.js
import { SHEET_IDS, fetchSheet } from './api.js';

document.addEventListener("DOMContentLoaded", () => {
  const empID = sessionStorage.getItem("empID");
  if (!empID) {
    alert("Please log in first.");
    window.location.href = "index.html";
    return;
  }

  // Load session values into header
  document.getElementById("userName").textContent = sessionStorage.getItem("displayName") || empID;
  document.getElementById("userLevel").textContent = sessionStorage.getItem("currentLevel") || "N/A";
  document.getElementById("currentMonth").textContent = sessionStorage.getItem("currentMonth") || "Unknown";

  // Highlight active sidebar link
  const path = window.location.pathname.split("/").pop().toLowerCase();
  document.querySelectorAll(".sidebar a[href]").forEach(link => {
    if (link.getAttribute("href").toLowerCase() === path) {
      link.classList.add("active");
    }
  });

  const tbody = document.getElementById('powerHoursBody');
  fetchSheet(SHEET_IDS.powerHours)
    .then(sheet => {
      const colMap = {};
      sheet.columns.forEach(col => {
        colMap[col.title.trim().toLowerCase()] = col.id;
      });

      const getVal = (row, colTitle) => {
        const id = colMap[colTitle.trim().toLowerCase()];
        const cell = row.cells.find(c => c.columnId === id);
        return cell ? (cell.displayValue ?? cell.value ?? '') : '';
      };

      const matchingRows = sheet.rows.filter(r => {
        const rawID = getVal(r, 'employee id');
        return rawID?.toString().toUpperCase() === empID;
      });

      tbody.innerHTML = matchingRows.length === 0
        ? '<tr><td colspan="8">No Power Hours records found.</td></tr>'
        : '';

      let totalHours = 0;

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

      document.getElementById("hoursTally").textContent = `Total Power Hours Logged: ${totalHours}`;
      sessionStorage.setItem("totalPowerHoursLogged", totalHours);
    })
    .catch(err => {
      console.error("Error loading Power Hours data:", err);
      tbody.innerHTML = '<tr><td colspan="8">Failed to load Power Hours data.</td></tr>';
    });
});
