import { initializePage } from './layout.js';
import { SHEET_IDS, fetchSheet } from './api.js';
import './session.js';

document.addEventListener("DOMContentLoaded", async () => {
  await initializePage();  // Load sidebar + header

  const empID = sessionStorage.getItem("empID");
  if (!empID) {
    alert("Session expired. Please log in again.");
    window.location.href = "index.html";
    return;
  }

  const container = document.getElementById("powerHoursTableContainer");
  const tally = document.getElementById("hoursTally");

  try {
    const sheet = await fetchSheet(SHEET_IDS.powerHours);
    const colMap = {};
    sheet.columns.forEach(col => {
      colMap[col.title.trim().toLowerCase()] = col.id;
    });

    const getVal = (row, colTitle) => {
      const id = colMap[colTitle.toLowerCase()];
      const cell = row.cells.find(c => c.columnId === id);
      return cell?.displayValue ?? cell?.value ?? '';
    };

    const matchingRows = sheet.rows.filter(r =>
      getVal(r, 'employee id').toString().toUpperCase() === empID
    );

    if (matchingRows.length === 0) {
      container.innerHTML = "<p>No Power Hours records found.</p>";
      return;
    }

    // Build Table
    const table = document.createElement("table");
    table.classList.add("powerup-table");

    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>PH ID</th>
        <th>Date</th>
        <th>Start Time</th>
        <th>End Time</th>
        <th>Scheduled?</th>
        <th>Completed?</th>
        <th>Activity</th>
        <th>Hours</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    let totalHours = 0;

    matchingRows.forEach(r => {
      const row = document.createElement("tr");

      const id = getVal(r, "power hour id");
      const date = getVal(r, "date");
      const start = getVal(r, "start time");
      const end = getVal(r, "end time");
      const scheduled = getVal(r, "scheduled").toString().toLowerCase() === 'true' ? '✔️' : '❌';
      const completed = getVal(r, "completed").toString().toLowerCase() === 'true' ? '✔️' : '❌';
      const desc = getVal(r, "activity description");
      const hours = parseFloat(getVal(r, "completed hours") || 0);

      totalHours += hours;

      [id, date, start, end, scheduled, completed, desc, hours].forEach(val => {
        const td = document.createElement("td");
        td.textContent = val;
        row.appendChild(td);
      });

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);

    tally.textContent = `Total Power Hours Logged: ${totalHours}`;

  } catch (err) {
    console.error("Failed to load Power Hours data:", err);
    container.innerHTML = "<p>Error loading data. Please try again later.</p>";
  }
});
