// /scripts/init-power-hours.js
import { SHEET_IDS, fetchSheet } from './api.js';
import { renderTable } from './table.js';
import './session.js';

document.addEventListener('DOMContentLoaded', async () => {
  const empID = sessionStorage.getItem('empID');
  if (!empID) return;

  // ✅ Wait one tick to ensure header/sidebar is fully loaded
  await new Promise(r => setTimeout(r, 0));

  try {
    const sheet = await fetchSheet(SHEET_IDS.powerHours);

    // Filter for user’s rows
    const userRows = sheet.rows.filter(r =>
      r.cells.some(c => String(c.value).toUpperCase() === empID)
    );

    // Optional: update header info (current month + level from sessionStorage)
    const level = sessionStorage.getItem('currentLevel') ?? 'N/A';
    const month = sessionStorage.getItem('currentMonth') ?? 'Unknown';

    document.getElementById('userLevel').textContent = level;
    document.getElementById('currentMonth').textContent = month;

    // Update name if available
    const displayName = sessionStorage.getItem('displayName');
    if (displayName) {
      document.getElementById('userGreeting').textContent = displayName;
    }

    // Table display
    renderTable({
      sheet,
      containerId: 'powerHoursContainer',
      title: 'Power Hours Log',
      columnOrder: ['Power Hour ID', 'Date', 'Start Time', 'End Time', 'Scheduled', 'Completed'],
      filterFn: r => r.cells.some(c => String(c.value).toUpperCase() === empID)
    });

  } catch (err) {
    console.error('Error loading Power Hours:', err);
    document.getElementById('powerHoursContainer').innerHTML =
      '<p>Failed to load power hours.</p>';
  }
});
