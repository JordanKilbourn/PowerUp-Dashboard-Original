import { loadPageComponents }  from './loadPageComponents.js';
import { getSheetRows }        from './api.js';
import { setSession }          from './session.js';
import { renderAccordion }     from './dashboard-ui.js';

const SHEETS = {
  ci:     '6584024920182660',
  safety: '4089265651666820',
  qc:     '1431258165890948',
  level:  '8346763116105604'
};

document.addEventListener('DOMContentLoaded', async () => {
  await loadPageComponents();

  if (!sessionStorage.getItem('empID')) {
    window.location.href = 'index.html';
    return;
  }

  await Promise.all([
    loadSection('ciContent',     SHEETS.ci),
    loadSection('safetyContent', SHEETS.safety),
    loadSection('qcContent',     SHEETS.qc),
    hydrateLevelBadge()          // sets month + level
  ]);
});

/* ---------- helpers ---------- */
async function loadSection(containerId, sheetId) {
  const sheet = await getSheetRows(sheetId);
  renderAccordion(containerId, sheet);
}

async function hydrateLevelBadge() {
  const empID = sessionStorage.getItem('empID')?.toUpperCase();
  if (!empID) return;

  const sheet = await getSheetRows(SHEETS.level);
  const rows  = sheet.rows.filter(r =>
    r.cells.some(c => c.value?.toString().toUpperCase() === empID));

  if (!rows.length) return;

  rows.sort((a, b) =>
    new Date(a.modifiedAt) - new Date(b.modifiedAt));
  const latest = rows.at(-1);

  const colBy = t => sheet.columns.find(c => c.title.trim().toLowerCase() === t);
  const get   = t => latest.cells.find(c => c.columnId === colBy(t)?.id)?.displayValue;

  const lvl      = get('level')       || '—';
  const monthKey = get('month key')   || latest.modifiedAt;
  const monthStr = new Date(monthKey)
      .toLocaleString('default', { month:'long', year:'numeric' });

  setSession('currentLevel', lvl);
  setSession('currentMonth', monthStr);
}
