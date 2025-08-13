// Dynamic loader for refreshed dashboard (CI / Safety / Quality)

/* ── Imports ─────────────────────────────────────────────────── */
import { fetchSheet, SHEET_IDS } from './api.js';
import { renderTable }           from './table.js';
import './session.js';

/* ── Column order config ───────────────────────────────────────
   NOTE: These must match your Smartsheet column titles. */
const COLS = {
  ci: [
    "Submission Date",
    "Submission ID",
    "Problem Statements",
    "Proposed Improvement",
    "CI Approval",
    "Assigned To (Primary)",      // will be labeled “Assigned To”
    "Status",
    "Action Item Entry Date",
    "Last Meeting Action Item's",
    "Token Payout",
    "Paid"
  ],

  safety: [
    "Date",
    "Facility",
    "Department/Area",
    "Safety Concern",
    "Describe the safety concern",
    "Recommendations to correct/improve safety issue",
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

/* ── Add sortable headers after renderTable() runs ────────────── */
const attachSort = (type) => {
  document.querySelectorAll(`#${type}-table thead th`)
    .forEach((th, idx) => {
      th.classList.add('sortable');
      th.onclick = () => sortTable(type, idx); // uses helper in HTML
    });
};

/* ── Optional: per-tab “Expand rows” toggle ───────────────────── */
function addWrapToggle(tabId) {
  const panel    = document.querySelector(`#tab-${tabId} .table-scroll`);
  const controls = document.querySelector(`#tab-${tabId} .table-header-controls`);
  if (!panel || !controls || controls.querySelector('.wrap-toggle')) return;

  const btn = document.createElement('button');
  btn.className = 'add-btn wrap-toggle';
  btn.textContent = 'Expand rows';
  let expanded = false;

  btn.onclick = () => {
    expanded = !expanded;
    panel.classList.toggle('expanded', expanded);
    btn.textContent = expanded ? 'Collapse rows' : 'Expand rows';
  };

  controls.appendChild(btn);
}

/* ── Page bootstrap ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof initializeSession === 'function') initializeSession();
  loadCI(); loadSafety(); loadQuality();
});

/* ── Loaders ─────────────────────────────────────────────────── */
async function loadCI(){
  try{
    const sheet = await fetchSheet(SHEET_IDS.ciSubmissions);
    renderTable({
      sheet,
      containerId: 'ci-table',
      columnOrder: COLS.ci,
      checkmarkCols: ['Paid']  // ✓ / ✗ rendering
    });
    attachSort('ci'); filterTable('ci'); addWrapToggle('ci');
  }catch(e){ console.error('CI load', e); }
}

async function loadSafety(){
  try{
    const sheet = await fetchSheet(SHEET_IDS.safetyConcerns);
    renderTable({
      sheet,
      containerId: 'safety-table',
      columnOrder: COLS.safety
    });
    attachSort('safety'); filterTable('safety'); addWrapToggle('safety');
  }catch(e){ console.error('Safety load', e); }
}

async function loadQuality(){
  try{
    const sheet = await fetchSheet(SHEET_IDS.qualityCatches);
    renderTable({
      sheet,
      containerId: 'quality-table',
      columnOrder: COLS.quality
    });
    attachSort('quality'); filterTable('quality'); addWrapToggle('quality');
  }catch(e){ console.error('Quality load', e); }
}
