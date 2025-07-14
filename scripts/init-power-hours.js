// /scripts/init-power-hours.js
import './session.js';

document.addEventListener("DOMContentLoaded", async () => {
  const empID = sessionStorage.getItem("empID");
  const displayName = sessionStorage.getItem("displayName");

  if (!empID) {
    alert("Please log in first.");
    window.location.href = "index.html";
    return;
  }

  // Inject components
  const [sidebarHTML, headerHTML] = await Promise.all([
    fetch("/components/sidebar.html").then(res => res.text()),
    fetch("/components/header.html").then(res => res.text())
  ]);

  document.getElementById("sidebar").innerHTML = sidebarHTML;
  document.getElementById("header").innerHTML = headerHTML;

  // Set active link
  const path = window.location.pathname.split("/").pop().toLowerCase();
  document.querySelectorAll(".sidebar a[href]").forEach(link => {
    if (link.getAttribute("href").toLowerCase() === path) {
      link.classList.add("active");
    }
  });

  const nameEl = document.getElementById("userGreeting");
  if (nameEl) nameEl.textContent = displayName || empID;

  // ✅ Load Power Hours
  loadPowerHours(empID);
});

function loadPowerHours(empID) {
  const sheetID = '1240392906264452';
  const url = `https://powerup-proxy.onrender.com/sheet/${sheetID}`;
  const tbody = document.getElementById('powerHoursBody');

  fetch(url)
    .then(res => res.json())
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
        ? '<tr><td colspan="8">No matching Power Hours records found.</td></tr>'
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

      const hoursDisplay = document.getElementById("hoursTally");
      hoursDisplay.textContent = `Total Power Hours Logged: ${totalHours}`;
      sessionStorage.setItem("totalPowerHoursLogged", totalHours);
    })
    .catch(err => {
      console.error('Fetch error:', err);
      tbody.innerHTML = '<tr><td colspan="8">Failed to load Power Hours data.</td></tr>';
    });
}
