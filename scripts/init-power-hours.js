// scripts/init-power-hours.js
import { loadPageComponents } from './loadPageComponents.js';
import { SHEET_IDS, fetchSheet } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadPageComponents();

  const empID = sessionStorage.getItem('empID');
  if (!empID) { window.location.href = 'index.html'; return; }

  try {
    const sheet = await fetchSheet(SHEET_IDS.powerHours);
    const colMap = {};
    sheet.columns.forEach(c => colMap[c.title.trim().toLowerCase()] = c.id);

    const getVal = (row, key) => {
      const cell = row.cells.find(c => c.columnId === colMap[key.toLowerCase()]);
      return cell?.displayValue ?? cell?.value ?? '';
    };

    const rows = sheet.rows.filter(r =>
      getVal(r,'employee id').toString().toUpperCase() === empID
    );

    let total = 0;
    const tbody = document.getElementById('powerHoursBody');
    tbody.innerHTML = ''; 
    
    rows.forEach(row => {
      const ch = parseFloat(getVal(row,'completed hours')) || 0;
      total += ch;
      const tr = document.createElement('tr');
      ['power hour id','date','start time','end time','scheduled','completed','completed hours','activity description']
        .forEach(key => {
          const td = document.createElement('td');
          if (['scheduled','completed'].includes(key)) {
            td.textContent = getVal(row,key) === true ? '✔️' : '❌';
          } else {
            td.textContent = key === 'completed hours' ? ch : getVal(row, key);
          }
          td.title = td.textContent;
          tr.appendChild(td);
        });
      tbody.appendChild(tr);
    });

    document.getElementById('hoursTally').textContent =
      `Total Power Hours Logged: ${total}`;
  } catch (err) {
    console.error(err);
    document.getElementById('powerHoursBody').innerHTML =
      '<tr><td colspan="8">Failed to load Power Hours.</td></tr>';
  }
});
