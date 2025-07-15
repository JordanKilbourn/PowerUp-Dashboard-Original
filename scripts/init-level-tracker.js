import { loadPageComponents }  from './loadPageComponents.js';
import { SHEET_IDS, fetchSheet } from './api.js';
import { renderTable }          from './table.js';
import { setSession }           from './session.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadPageComponents();

  const empID = sessionStorage.getItem('empID');
  if (!empID) { window.location.href = 'index.html'; return; }

  try {
    const sheet = await fetchSheet(SHEET_IDS.levelTracker);

    // find latest record for this employee
    const rows = sheet.rows.filter(r =>
      r.cells.some(c => c.value?.toString().toUpperCase() === empID));

    rows.sort((a, b) =>
      new Date(b.cells[0].value) - new Date(a.cells[0].value));

    const latest = rows[0];
    if (latest) {
      const colBy = t => sheet.columns.find(c => c.title.trim().toLowerCase() === t);
      const get   = t => latest.cells.find(c => c.columnId === colBy(t)?.id)?.displayValue;

      const level     = get('level')     || 'N/A';
      const monthKey  = get('month key');
      const monthStr  = monthKey
        ? new Date(monthKey).toLocaleString('default', { month:'long', year:'numeric' })
        : new Date().toLocaleString('default', { month:'long', year:'numeric' });

      setSession('currentLevel',  level);
      setSession('currentMonth',  monthStr);
    }

    renderTable({
      sheet,
      containerId: 'levelTableContainer',
      title: 'Monthly Level Tracker',
      checkmarkCols: ['Meets L1','Meets L2','Meets L3'],
      columnOrder: [
        'Month Key','CI Submissions','Safety Submissions','Quality Submissions',
        'Total Submissions','Power Hours Logged',
        'Meets L1','Meets L2','Meets L3','Level'
      ]
    });
  } catch (err) {
    console.error(err);
    document.getElementById('levelTableContainer').innerHTML =
      '<p>Failed to load level data.</p>';
  }
});
