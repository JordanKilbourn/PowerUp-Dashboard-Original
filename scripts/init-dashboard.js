// scripts/init-dashboard.js

import { loadPageComponents } from './loadPageComponents.js';
import { getSheetRows } from './api.js';
import { renderAccordion } from './dashboard-ui.js';

const SHEET_IDS = {
  ci: '6584024920182660',       // actual CI Sheet
  safety: '4089265651666820',   // will support later
  qc: '1431258165890948',       // will support later
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

    // ✅ Add accordion toggle behavior AFTER content is rendered
    document.querySelectorAll('.accordion-header').forEach(header => {
      header.addEventListener('click', () => {
        const targetId = header.getAttribute('data-target');
        const content = document.getElementById(targetId);
        const icon = header.querySelector('.rotate-icon');

        // Toggle `.open` class on the parent .accordion-item
        header.parentElement.classList.toggle('open');

        // Toggle the accordion content
        if (content) content.classList.toggle('open');

        // Rotate the chevron icon
        if (icon) icon.classList.toggle('open');
      });
    });

  } catch (err) {
    console.error('Error loading dashboard data:', err);
  }
});
