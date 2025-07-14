// /scripts/init-power-hours.js
import { SHEET_IDS, fetchSheet } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  await window.loadPageComponents?.();

  const empID = sessionStorage.getItem('empID');
  if (!empID) return;

  const tbody = document.getElementById('powerHoursBody');
  try {
    const sheet = await fetchSheet(SHEET_IDS.powerHours);
    const colMap = Object.fromEntries(sheet.columns.map(c => [c.title.trim().toLowerCase(), c.id]));

    const getVal = (row, title) => {
      const cell = row.cells.find(c => c.columnId === colMap[title.toLowerCase()]);
      return cell?.displayValue ?? cell?.value ?? '';
    };

    const rows = sheet.rows.filter(r => {
      const rawID = getVal(r, 'employee id');
      return rawID.toString().toUpperCase() === empID;
    });

    tbody.innerHTML = rows.length
      ? ''
      : '<tr><td colspan="8">No Power Hours records found.</td></tr>';

    let total = 0;
    for (const r of rows) {
      const completed = parseFloat(getVal(r, 'completed hours')) || 0;
      total += completed;
      const values = [
        getVal(r, 'power hour id'),
        getVal(r, 'date'),
        getVal(r, 'start time'),
        getVal(r, 'end time'),
        getVal(r, 'scheduled') === true ? '✔️' : '❌',
        getVal(r, 'completed') === true ? '✔️' : '❌',
        completed,
        getVal(r, 'activity description')
      ];

      const tr = document.createElement('tr');
      for (const v of values) {
        const td = document.createElement('td');
        td.textContent = v;
        td.title = v;
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }

    document.getElementById('hoursTally').textContent = `Total Power Hours Logged: ${total}`;
    sessionStorage.setItem('totalPowerHoursLogged', total);
  } catch (err) {
    console.error('Error loading Power Hours data:', err);
    tbody.innerHTML = '<tr><td colspan="8">Failed to load Power Hours data.</td></tr>';
  }
});
