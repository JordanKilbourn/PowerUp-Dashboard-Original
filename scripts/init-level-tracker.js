// /scripts/init-level-tracker.js
import { loadPageComponents } from './loadPageComponents.js';
import { SHEET_IDS, fetchSheet } from './api.js';
import { renderTable } from './table.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadPageComponents();

  const empID = sessionStorage.getItem('empID');
  if (!empID) return window.location.href = 'index.html';

  try {
    const sheet = await fetchSheet(SHEET_IDS.levelTracker);

    const latest = sheet.rows
      .filter(r => r.cells.some(c => c.value?.toString().toUpperCase() === empID))
      .sort((a,b) => new Date(b.cells[0].value) - new Date(a.cells[0].value))[0];

    if (latest) {
      const colMap = Object.fromEntries(sheet.columns.map(c => [c.title.trim().toLowerCase(), c.id]));
      const getVal = (key) => {
        const cell = latest.cells.find(c => c.columnId === colMap[key.toLowerCase()]);
        return cell?.displayValue ?? cell?.value ?? '';
      };

      const level = getVal('Level') || 'N/A';
      const monthKey = getVal('Month Key');
      const monthStr = monthKey ? new Date(monthKey).toLocaleString('default', { month:'long', year:'numeric'}) : 'Unknown';

      sessionStorage.setItem('currentLevel', level);
      sessionStorage.setItem('currentMonth', monthStr);
    }

    renderTable({
      sheet,
      containerId: 'levelTableContainer',
      title: 'Monthly Level Tracker',
      checkmarkCols: ['Meets L1','Meets L2','Meets L3'],
      columnOrder: ['Month Key','CI Submissions','Safety Submissions','Quality Submissions','Total Submissions','Power Hours Logged','Meets L1','Meets L2','Meets L3','Level']
    });
  } catch (err) {
    console.error(err);
    document.getElementById('levelTableContainer').innerHTML = '<p>Failed to load level data.</p>';
  }
});
