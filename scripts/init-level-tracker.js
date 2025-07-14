// scripts/init-level-tracker.js
import { SHEET_IDS, fetchSheet } from './api.js';
import { renderTable } from './table.js';

async function loadIncludes() {
  console.log('Loading sidebar/header');
  const [sidebarHtml, headerHtml] = await Promise.all([
    fetch('/components/sidebar.html').then(r => r.text()),
    fetch('/components/header.html').then(r => r.text()),
  ]);
  document.getElementById('sidebar').innerHTML = sidebarHtml;
  document.getElementById('header').innerHTML = headerHtml;
  console.log('Includes injected, now loading session');
  await import('./session.js'); // dynamically load session logic after injection
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadIncludes();

  console.log('Session should be initialized now');

  const empID = sessionStorage.getItem('empID');
  if (!empID) {
    console.warn('No empID in sessionStorage—aborting');
    return;
  }

  console.log('empID found:', empID);

  try {
    const sheet = await fetchSheet(SHEET_IDS.levelTracker);
    console.log('Level Tracker sheet fetched:', sheet.columns.length, 'columns');

    const latest = sheet.rows
      .filter(r =>
        r.cells.some(c => c.value?.toString().toUpperCase() === empID)
      )
      .sort((a, b) => new Date(b.cells[0].value) - new Date(a.cells[0].value))[0];

    if (latest) {
      console.log('Latest record found for empID', empID);
      const getCell = key => {
        const col = sheet.columns.find(c => c.title.trim().toLowerCase() === key.toLowerCase());
        return latest.cells.find(c => c.columnId === col?.id)?.displayValue || '';
      };
      const level = getCell('Level') || 'N/A';
      const monthKey = getCell('Month Key');
      const monthStr = monthKey
        ? new Date(monthKey).toLocaleString('default', { month: 'long', year: 'numeric' })
        : 'Unknown';

      console.log('Setting sessionStorage and header values:', level, monthStr);
      sessionStorage.setItem('currentLevel', level);
      sessionStorage.setItem('currentMonth', monthStr);
      document.getElementById('userLevel').textContent = level;
      document.getElementById('currentMonth').textContent = monthStr;
    } else {
      console.warn('No matching row found for empID');
    }

    renderTable({
      sheet,
      containerId: 'levelTableContainer',
      title: 'Monthly Level Tracker',
      checkmarkCols: ['Meets L1', 'Meets L2', 'Meets L3'],
      columnOrder: [
        'Month Key','CI Submissions','Safety Submissions','Quality Submissions',
        'Total Submissions','Power Hours Logged','Meets L1','Meets L2','Meets L3','Level'
      ]
    });
  } catch (err) {
    console.error('Error loading Level Tracker:', err);
    document.getElementById('levelTableContainer').innerHTML = `<p>Failed to load level data.</p>`;
  }
});
