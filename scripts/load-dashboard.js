import { renderTable } from './table.js';
import { fetchSheet, fetchReport, SHEET_IDS } from './scripts/api.js';
import './session.js';

function loadDashboard() {
  const empID = sessionStorage.getItem('empID');
  if (!empID) {
    console.warn('No empID in session, redirecting to login');
    window.location.href = 'index.html';
    return;
  }

  const globalError = document.createElement('div');
  globalError.id = 'globalError';
  globalError.style.color = '#f87171';
  document.body.prepend(globalError);

  Promise.all([
    fetchSheet(SHEET_IDS.levelTracker),
    fetchSheet(SHEET_IDS.powerHours),
    fetchSheet(SHEET_IDS.ciSubmissions),
    fetchReport(SHEET_IDS.safetyConcerns),
    fetchReport(SHEET_IDS.qualityCatches)
  ])
    .then(([level, hours, ci, safety, qc]) => {
      console.log('Fetched data:', { level, hours, ci, safety, qc });
      updateLevelInfo(level);
      updatePowerHours(hours);

      renderTable({
        sheet: ci,
        containerId: 'ciContent',
        title: 'CI Submissions',
        checkmarkCols: ['Resourced', 'Paid', 'Project Work Completed'],
        excludeCols: ['Submitted By', 'Valid Row', 'Employee ID'],
        filterByEmpID: true
      });
      console.log('CI Content:', document.getElementById('ciContent').innerHTML);

      renderTable({
        sheet: safety,
        containerId: 'safetyContent',
        title: 'Safety Concerns',
        excludeCols: ['Employee ID'],
        filterByEmpID: true
      });
      console.log('Safety Content:', document.getElementById('safetyContent').innerHTML);

      renderTable({
        sheet: qc,
        containerId: 'qcContent',
        title: 'Quality Catches',
        excludeCols: ['Employee ID'],
        filterByEmpID: true
      });
      console.log('QC Content:', document.getElementById('qcContent').innerHTML);

      document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
          const content = document.getElementById(header.dataset.target);
          const icon = header.querySelector('.rotate-icon');
          const isOpen = content.classList.toggle('open');
          icon.classList.toggle('open', isOpen);
          console.log(`Accordion ${header.dataset.target} toggled, open: ${isOpen}`);
        });
      });
    })
    .catch(err => {
      console.error('Failed to load dashboard data:', err);
      globalError.textContent = 'Error loading data. Check console.';
    });
}

function updateLevelInfo(sheet) {
  const empID = sessionStorage.getItem('empID');
  const rows = sheet.rows.filter(r => r.cells.some(c => String(c.value).toUpperCase() === empID));
  console.log('Level rows for empID:', empID, rows);

  if (rows.length === 0) {
    console.warn('No level data for empID:', empID);
    return;
  }

  const latest = rows.sort((a, b) => new Date(b.cells[0].value) - new Date(a.cells[0].value))[0];
  const get = (title) => {
    const col = sheet.columns.find(c => c.title.toLowerCase().includes(title.toLowerCase()));
    console.log(`Searching for ${title} column, found:`, col);
    const cell = latest.cells.find(x => x.columnId === col?.id);
    return cell?.displayValue || cell?.value || '';
  };

  const level = get('Level') || 'N/A';
  const monthKey = get('Month Key');
  const monthStr = monthKey ? new Date(monthKey).toLocaleString('default', { month: 'long', year: 'numeric' }) : 'Unknown';

  console.log('Level data:', { level, monthStr });
  // Removed direct DOM update; rely on session.js to update header
  sessionStorage.setItem('currentLevel', level);
  sessionStorage.setItem('currentMonth', monthStr);
}

async function updatePowerHours(sheet) {
  const empID = sessionStorage.getItem('empID');
  const currentLevel = sessionStorage.getItem('currentLevel') || 'N/A';

  const rows = sheet.rows.filter(r => r.cells.some(c => String(c.value).toUpperCase() === empID));
  let totalHours = 0;
  rows.forEach(row => {
    const completedCol = sheet.columns.find(c => c.title.toLowerCase().includes('completed'));
    const hoursCol = sheet.columns.find(c => c.title.toLowerCase().includes('completed hours'));
    const isCompleted = row.cells.find(c => c.columnId === completedCol?.id)?.value === true;
    const completedVal = row.cells.find(c => c.columnId === hoursCol?.id)?.value;

    if (isCompleted && typeof completedVal === 'number') totalHours += completedVal;
  });

  let minTarget = 8;
  let maxTarget = 12;

  try {
    const targetsRes = await fetchSheet('3542697273937796');
    const levelRow = targetsRes.rows.find(r => r.cells.some(c => String(c.displayValue).toLowerCase() === currentLevel.toLowerCase()));
    if (levelRow) {
      const get = (title) => {
        const col = targetsRes.columns.find(c => c.title.toLowerCase().includes(title.toLowerCase()));
        const cell = levelRow.cells.find(x => x.columnId === col?.id);
        return parseFloat(cell?.displayValue || cell?.value || '');
      };
      minTarget = get('Min Hours') || minTarget;
      maxTarget = get('Max Hours') || maxTarget;
    }
  } catch (err) {
    console.warn('Power Hour Targets not loaded, using default:', err);
  }

  const percent = Math.min((totalHours / minTarget) * 100, 100);
  const barEl = document.getElementById('progressBar');
  const phEl = document.getElementById('phProgress');
  const tipsEl = document.getElementById('powerTips');

  if (barEl) barEl.style.width = `${percent}%`;
  if (phEl) phEl.textContent = `${totalHours.toFixed(1)} / ${minTarget}`;
  if (tipsEl) {
    tipsEl.textContent = totalHours >= minTarget && totalHours <= maxTarget
      ? '✅ Target met! Great job!'
      : totalHours > maxTarget
        ? '🎉 You\'ve gone above and beyond!'
        : `You\'re ${(minTarget - totalHours).toFixed(1)} hour(s) away. ${new Date().getDate() - new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()} days left.`;
  }
}

export { loadDashboard };

document.addEventListener('DOMContentLoaded', loadDashboard);
