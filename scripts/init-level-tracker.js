/* scripts/init-level-tracker.js
   – shows full level history table */

import { loadPageComponents } from './loadPageComponents.js';
import { getSheetRows }       from './api.js';
import { renderTable }        from './table.js';
import { setSession }         from './session.js';

const SHEET_ID = '8346763116105604'; // Level Tracker sheet

document.addEventListener('DOMContentLoaded', async () => {
  await loadPageComponents();
  if (!sessionStorage.getItem('empID')) {
    window.location.href = 'index.html';
    return;
  }

  const empID = sessionStorage.getItem('empID').toUpperCase();

  /* fetch sheet + filter to this employee */
  const sheet = await getSheetRows(SHEET_ID);
  const rows  = sheet.rows.filter(r =>
      (r.cells.find(c => c.columnId === sheet.columnsByTitle['Employee ID'].id)
               ?.displayValue ?? '').toUpperCase() === empID);

  /* render table */
  renderTable({
    sheet,
    containerId: 'levelBody',
    rowFilter: rows,
    columnOrder: ['Date','Level','Hours This Month','Comment']
  });

  /* badge update (in case user lands here first) */
  if (rows.length) {
    const latest = rows.sort((a,b)=>new Date(a.modifiedAt)-new Date(b.modifiedAt)).at(-1);
    const lvl = latest.cells.find(c => c.columnId === sheet.columnsByTitle.Level.id)
                    ?.displayValue ?? '—';
    const month = new Date(latest.modifiedAt)
                    .toLocaleString('default', { month: 'long', year: 'numeric' });

    setSession('currentLevel', lvl);
    setSession('currentMonth', month);

    document.getElementById('userLevel').textContent    = lvl;
    document.getElementById('currentMonth').textContent = month;
  }
});
