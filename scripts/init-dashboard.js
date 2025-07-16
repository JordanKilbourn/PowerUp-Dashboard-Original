/* scripts/init-dashboard.js
   – main overview page bootstrap */

import { loadPageComponents } from './loadPageComponents.js';
import { getSheetRows }       from './api.js';
import { setSession }         from './session.js';
import { renderAccordion }    from './dashboard-ui.js';

/* ---- Smartsheet IDs ---- */
const SHEETS = {
  ci:      '6584024920182660',   // CI Submissions
  safety:  '4089265651666820',   // Safety Concerns
  qc:      '1431258165890948',   // Quality Catches
  level:   '8346763116105604'    // Level Tracker (for month/level badges)
};

document.addEventListener('DOMContentLoaded', async () => {
  /* 1️⃣ layout + auth */
  await loadPageComponents();
  if (!sessionStorage.getItem('empID')) {
    window.location.href = 'index.html';
    return;
  }

  /* 2️⃣ summary accordions (CI / Safety / QC) */
  await Promise.all([
    loadSection('ciContent',     SHEETS.ci),
    loadSection('safetyContent', SHEETS.safety),
    loadSection('qcContent',     SHEETS.qc)
  ]);

  /* 3️⃣ update current level & month badge once per login */
  await hydrateLevelBadge();
});

/* ---------- helpers ---------- */
async function loadSection(containerId, sheetId) {
  const sheet = await getSheetRows(sheetId);
  renderAccordion(containerId, sheet);   // dashboard-ui.js handles table/cards etc.
}

async function hydrateLevelBadge() {
  const empID = sessionStorage.getItem('empID')?.toUpperCase();
  if (!empID) return;

  const sheet = await getSheetRows(SHEETS.level);
  const rows  = sheet.rows
      .filter(r =>
        (r.cells.find(c => c.columnId === sheet.columnsByTitle['Employee ID'].id)
                 ?.displayValue ?? '').toUpperCase() === empID)
      .sort((a, b) => new Date(a.modifiedAt) - new Date(b.modifiedAt));

  if (!rows.length) return;
  const latest = rows.at(-1);   // newest entry

  const lvl = latest.cells.find(c => c.columnId === sheet.columnsByTitle.Level.id)
                  ?.displayValue ?? '—';
  const month = new Date(latest.modifiedAt)
                  .toLocaleString('default', { month: 'long', year: 'numeric' });

  setSession('currentLevel', lvl);
  setSession('currentMonth', month);

  // refresh header badges
  document.getElementById('userLevel').textContent    = lvl;
  document.getElementById('currentMonth').textContent = month;
}
