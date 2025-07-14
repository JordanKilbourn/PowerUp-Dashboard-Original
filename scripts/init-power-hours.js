import { loadPageComponents } from './loadPageComponents.js';
import { getSheetRows }        from './api.js';
import { renderTable }         from './table.js';

const SHEET_ID = '1240392906264452';  // Power Hours Tracker

document.addEventListener('DOMContentLoaded', async () => {
  await loadPageComponents();

  const empID = sessionStorage.getItem('empID');
  if (!empID) { window.location.href = 'index.html'; return; }

  /* 1️⃣ fetch and filter */
  const sheet = await getSheetRows(SHEET_ID);
  const rows  = sheet.rows.filter(r =>
     (r.cells.find(c => c.columnId === sheet.columnsByTitle['Employee ID'].id)
              ?.displayValue ?? '').toUpperCase() === empID.toUpperCase());

  /* 2️⃣ render table */
  renderTable({
    sheet,
    containerId: 'powerHoursBody',
    rowFilter: rows,
    checkmarkCols: ['Scheduled','Completed'],
    columnOrder: ['Power Hour ID','Date','Start Time','End Time',
                  'Scheduled','Completed','Completed Hours','Activity Description']
  });

  /* 3️⃣ tally */
  const tally = rows.reduce((sum, r) =>
      sum + Number(r.cells.find(c => c.columnId === sheet.columnsByTitle['Completed Hours'].id)
                             ?.value || 0), 0);
  document.getElementById('hoursTally').textContent =
    `Total Power Hours Logged: ${tally}`;
});
