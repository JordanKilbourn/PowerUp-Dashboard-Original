import { loadPageComponents } from './loadPageComponents.js';
import { SHEET_IDS, fetchSheet } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadPageComponents();

  const empID = sessionStorage.getItem('empID');
  if (!empID) {
    window.location.href = 'index.html';
    return;
  }

  const tbody = document.getElementById('powerHoursBody');
  try {
    const sheet = await fetchSheet(SHEET_IDS.powerHours);
    const colMap = {};
    sheet.columns.forEach(c => colMap[c.title.trim().toLowerCase()] = c.id);

    const getVal = (row, title) => {
      const id = colMap[title.toLowerCase()];
      const cell = row.cells.find(c => c.columnId === id);
      return cell?.displayValue ?? cell?.value ?? '';
    };

    const entries = sheet.rows.filter(r => getVal(r,'employee id').toString().toUpperCase() === empID);

    let totalH = 0;
    tbody.innerHTML = '';
    entries.forEach(r => {
      const valH = parseFloat(getVal(r,'completed hours')) || 0;
      totalH += valH;
      const tr = document.createElement('tr');
      ['power hour id','date','start time','end time','scheduled','completed','completed hours','activity description']
      .forEach(title => {
        const td = document.createElement('td');
        td.textContent = title === 'scheduled' || title==='completed'
          ? (getVal(r,title)===true?'✔️':'❌')
          : (title === 'completed hours'? valH : getVal(r,title));
        td.title = td.textContent;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    document.getElementById('hoursTally').textContent = `Total Power Hours Logged: ${totalH}`;
    sessionStorage.setItem('currentMonth', sessionStorage.getItem('currentMonth')); // preserve
    sessionStorage.setItem('currentLevel', sessionStorage.getItem('currentLevel'));

  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="8">Failed to load Power Hours.</td></tr>';
  }
});
