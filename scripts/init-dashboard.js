// scripts/init-dashboard.js

import { loadPageComponents } from './include.js';
import { getSheetRows } from './api.js';
import { renderAccordion } from './dashboard-ui.js';

const SHEET_IDS = {
  ci: '6584024920182660',
  safety: '4089265651666820',
  qc: '1431258165890948',
};

document.addEventListener('DOMContentLoaded', async () => {
  await loadPageComponents();

  const empID = sessionStorage.getItem('empID');
  if (!empID) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const [ci, safety, qc] = await Promise.all([
      getSheetRows(SHEET_IDS.ci),
      getSheetRows(SHEET_IDS.safety),
      getSheetRows(SHEET_IDS.qc),
    ]);

    renderAccordion('ciContent', ci, empID);
    renderAccordion('safetyContent', safety, empID);
    renderAccordion('qcContent', qc, empID);
  } catch (err) {
    console.error('Error loading dashboard data:', err);
  }
});
