// /scripts/init-power-hours.js
import { loadPageComponents } from './loadPageComponents.js';
import { SHEET_IDS, fetchSheet } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadPageComponents();

  const empID = sessionStorage.getItem('empID');
  if (!empID) return window.location.href = 'index.html';

  // Fetch Power Hours
  const tbody = document.getElementById('powerHoursBody');
  let totalH = 0;

  try {
    const sheet = await fetchSheet(SHEET_IDS.powerHours);
    const colMap = Object.fromEntries(sheet.columns.map(c => [c.title.trim().toLowerCase(), c.id]));

    const getVal = (row, key) => (row.cells.find(c => c.columnId === colMap[key.toLowerCase()])?.value ?? '');

    const entries = sheet.rows.filter(r => getVal(r, 'employee id').toString().toUpperCase() === empID);
    tbody.innerHTML = '';

    entries.forEach(r => {
      const hours = parseFloat(getVal(r, 'completed hours')) || 0;
      totalH += hours;
      const tr = document.createElement('tr');
      ['power hour id','date','start time','end time','scheduled','completed'].forEach(col => {
        const td = document.createElement('td');
        td.textContent = ['scheduled','completed'].includes(col)
          ? (getVal(r, col) === true ? '✔️' : '❌')
          : getVal(r, col).toString();
        td.title = td.textContent;
        tr.appendChild(td);
      });
      ['completed hours','activity description'].forEach(col => {
        const td = document.createElement('td');
        td.textContent = col === 'completed hours' ? hours : getVal(r, col);
        td.title = td.textContent;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    document.getElementById('hoursTally').textContent = `Total Power Hours Logged: ${totalH}`;
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="8">Failed to load Power Hours.</td></tr>';
  }
});
