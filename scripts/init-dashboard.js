// Dynamic loader for refreshed dashboard (CI / Safety / Quality)

/* ── Imports ─────────────────────────────────────────────────── */
import { fetchSheet, SHEET_IDS } from './api.js';   // your proxy
import { renderTable }           from './table.js'; // renderer
import './session.js';                              // provides initializeSession()

/* ── Column order config ─────────────────────────────────────── */
const COLS = {
  ci: [
    "Submission Date",
    "Submission ID",
    "Problem Statements",
    "Proposed Improvement",
    "CI Approval",
    "Assigned To (Primary)",   // will display as "Assigned To" via table.js colHeaderMap
    "Status",
    "Action Item Entry Date",
    "Last Meeting Action Item's",
    "Token Payout",
    "Paid"
  ],

  // EXACT safety columns (12) in the order you provided
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

/* ── Pill (badge) formatter (kept here for future use) ───────── */
const PILL_CLASS = {
  approved:'approved', denied:'denied', rejected:'denied',
  pending:'pending','in progress':'pending', completed:'completed'
};
function pillify(txt){
  if(!txt) return '';
  const cls = PILL_CLASS[String(txt).trim().toLowerCase()];
  return cls ? `<span class="badge ${cls}">${txt}</span>` : txt;
}

/* ── Add sortable headers after renderTable() runs ────────────── */
const attachSort = type => {
  document.querySelectorAll(`#${type}-table thead th`)
    .forEach((th,idx)=>{
      th.classList.add('sortable');
      th.onclick = () => sortTable(type,idx);   // uses inline helper in HTML
    });
};

/* ── Page bootstrap ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded',()=>{
  if(typeof initializeSession==='function') initializeSession();
  loadCI(); loadSafety(); loadQuality();
});

/* ── Loaders ─────────────────────────────────────────────────── */
async function loadCI(){
  try{
    const sheet = await fetchSheet(SHEET_IDS.ciSubmissions);
    renderTable({
      sheet,
      containerId: 'ci-table',          // id only (no #)
      columnOrder: COLS.ci,
      checkmarkCols: ['Paid']           // check ✓/✗ rendering for Paid
      // Status/Approval pill styles handled inside table.js
    });
    attachSort('ci'); filterTable('ci');
  }catch(e){console.error('CI load', e);}
}

async function loadSafety(){
  try{
    const sheet = await fetchSheet(SHEET_IDS.safetyConcerns);
    renderTable({
      sheet,
      containerId: 'safety-table',
      columnOrder: COLS.safety
    });
    attachSort('safety'); filterTable('safety');
  }catch(e){console.error('Safety load', e);}
}

async function loadQuality(){
  try{
    const sheet = await fetchSheet(SHEET_IDS.qualityCatches);
    renderTable({
      sheet,
      containerId: 'quality-table',
      columnOrder: COLS.quality
    });
    attachSort('quality'); filterTable('quality');
  }catch(e){console.error('Quality load', e);}
}
