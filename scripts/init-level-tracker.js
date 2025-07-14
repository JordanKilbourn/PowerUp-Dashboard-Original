// /scripts/init-level-tracker.js
import { SHEET_IDS, fetchSheet } from './api.js';
import { renderTable } from './table.js';
import './session.js';

document.addEventListener('DOMContentLoaded', async () => {
  const empID = sessionStorage.getItem('empID');
  if (!empID) return;

  // Fetch level tracker data
  try {
    const sheet = await fetchSheet(SHEET_IDS.levelTracker);

    // Optional: update header info based on latest record
    const latest = [...sheet.rows]
      .filter(r => r.cells.some(c => c.value?.toString().toUpperCase() === empID))
      .sort((a,b) => new Date(b.cells[0].value) - new Date(a.cells[0].value))[0];
    
    if (latest) {
      const getCell = key => {
        const col = sheet.columns.find(c => c.title.trim().toLowerCase() === key.toLowerCase());
        return latest.cells.find(c => c.columnId === col?.id)?.displayValue || '';
      };
      const level = getCell('Level') || 'N/A';
      const monthKey = getCell('Month Key');
      const monthStr = monthKey
        ? new Date(monthKey).toLocaleString('default', { month: 'long', year: 'numeric' })
        : 'Unknown';

      document.getElementById('userLevel').textContent = level;
      document.getElementById('currentMonth').textContent = monthStr;

      sessionStorage.setItem('currentLevel', level);
      sessionStorage.setItem('currentMonth', monthStr);
    }

    // Render full table
    renderTable({
      sheet,
      containerId: 'levelTableContainer',
      title: 'Monthly Level Tracker',
      checkmarkCols: ['Meets L1', 'Meets L2', 'Meets L3'],
      columnOrder: [
        'Month Key', 'CI Submissions', 'Safety Submissions', 'Quality Submissions',
        'Total Submissions', 'Power Hours Logged',
        'Meets L1', 'Meets L2', 'Meets L3', 'Level'
      ]
    });

  } catch (err) {
    console.error('Error loading Level Tracker:', err);
    document.getElementById('levelTableContainer').innerHTML =
      '<p>Failed to load level data.</p>';
  }
});
