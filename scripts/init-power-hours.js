import { loadPageComponents }  from './loadPageComponents.js';
import { SHEET_IDS, fetchSheet } from './api.js';
import { renderTable }          from './table.js';
import { setSession }           from './session.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadPageComponents();

  const empID = sessionStorage.getItem('empID');
  if (!empID) { window.location.href = 'index.html'; return; }

  try {
    const sheet = await fetchSheet(SHEET_IDS.powerHours);
    const rows  = sheet.rows.filter(r =>
      r.cells.some(c => c.value?.toString().toUpperCase() === empID));

    /* ── write month badge ───────────────────────────── */
    if (rows.length) {
      const latest  = rows.at(-1);                  // newest row
      const dateCol = sheet.columns.find(c =>
        c.title.trim().toLowerCase() === 'date');
      const rawDate = latest.cells.find(c => c.columnId === dateCol?.id)?.value;
      if (rawDate) {
        const monthStr = new Date(rawDate)
          .toLocaleString('default', { month:'long', year:'numeric' });
        setSession('currentMonth', monthStr);       // header auto-refreshes
      }
    }
    /* ──────────────────────────────────────────────── */

    renderTable({
      sheet,
      containerId: 'powerHoursBody',
      title: 'Power Hours Log',
      checkmarkCols: ['Scheduled', 'Completed'],
      columnOrder: [
        'Power Hour ID','Date','Start Time','End Time','Scheduled',
        'Completed','Completed Hours','Activity Description'
      ],
      rowFilter: rows
    });
  } catch (err) {
    console.error(err);
    document.getElementById('powerHoursBody').innerHTML =
      '<tr><td colspan="8">Failed to load Power Hours data.</td></tr>';
  }
});
