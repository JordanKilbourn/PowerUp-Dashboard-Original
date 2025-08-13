// Dynamic loader for refreshed dashboard (CI / Safety / Quality)

/* ── Imports ─────────────────────────────────────────────────── */
import { fetchSheet, SHEET_IDS } from './api.js';
import { renderTable }           from './table.js';
import './session.js';

/* ── Column order config ─────────────────────────────────────── */
const COLS = {
  ci: [
    "Submission Date",
    "Submission ID",
    "Problem Statements",
    "Proposed Improvement",
    "CI Approval",
    "Assigned To (Primary)",   // shown as “Assigned To” via table.js header map
    "Status",
    "Action Item Entry Date",
    "Last Meeting Action Item's",
    "Token Payout",
    "Paid"
  ],
  safety: [
    // Full set you asked for (order can be tweaked anytime)
    "Submit Date",
    "Facility",
    "Department/Area",
    "Safety Concern",
    "Description",
    "Recommendations to correct/improve safety",
    "Resolution",
    "Maintenance Work Order Number or type NA if no W/O",
    "Who was the safety concern escalated to",
    "Did you personally speak to the leadership",
    "Leadership update",
    "Status"
  ],
  quality: [
    "Catch ID","Entry Date","Submitted By","Area",
    "Quality Catch","Part Number","Description","Status"
  ]
};

/* ── Page bootstrap ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof initializeSession === 'function') initializeSession();

  await Promise.all([loadCI(), loadSafety(), loadQuality()]);
  wireSorting();
  wireExpandRowsToggle();   // <— adds the Expand/Collapse rows behavior
});

/* ── Loaders ─────────────────────────────────────────────────── */
async function loadCI(){
  try{
    const sheet = await fetchSheet(SHEET_IDS.ciSubmissions);
    renderTable({
      sheet,
      containerId: 'ci-table',
      columnOrder:  COLS.ci,
      checkmarkCols:['Paid']
    });
  }catch(e){ console.error('CI load',e); }
}

async function loadSafety(){
  try{
    const sheet = await fetchSheet(SHEET_IDS.safetyConcerns);
    renderTable({
      sheet,
      containerId: 'safety-table',
      columnOrder:  COLS.safety
    });
  }catch(e){ console.error('Safety load',e); }
}

async function loadQuality(){
  try{
    const sheet = await fetchSheet(SHEET_IDS.qualityCatches);
    renderTable({
      sheet,
      containerId: 'quality-table',
      columnOrder:  COLS.quality
    });
  }catch(e){ console.error('Quality load',e); }
}

/* ── Sorting hook (adds click handlers to headers) ───────────── */
function wireSorting(){
  ['ci','safety','quality'].forEach(type => {
    document.querySelectorAll(`#${type}-table thead th`).forEach((th, idx) => {
      th.classList.add('sortable');
      th.addEventListener('click', () => window.sortTable(type, idx));
    });
  });
}

/* ── Expand / Collapse rows (clamp control via CSS var) ──────── */
function wireExpandRowsToggle(){
  // Find or create a button in each tab’s header controls
  document.querySelectorAll('.table-header-row .table-header-controls').forEach(group => {
    let btn = group.querySelector('.expand-rows');
    if (!btn) {
      btn = document.createElement('button');
      btn.className = 'add-btn expand-rows';
      btn.textContent = 'Expand rows';
      group.appendChild(btn);
    }

    btn.addEventListener('click', () => {
      const root = document.documentElement;   // toggles .rows-expanded on <html>
      const on   = root.classList.toggle('rows-expanded');
      btn.textContent = on ? 'Collapse rows' : 'Expand rows';
    });
  });
}
