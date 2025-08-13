// Dynamic loader for refreshed dashboard (CI / Safety / Quality)

/* ── Imports ─────────────────────────────────────────────────── */
import { fetchSheet, SHEET_IDS } from './api.js';
import { renderTable }           from './table.js';
import './session.js';

/* ── Column order config ─────────────────────────────────────── */
const COLS = {
  ci: [
    "Submission Date","Submission ID","Problem Statements","Proposed Improvement",
    "CI Approval","Assigned To (Primary)","Status","Action Item Entry Date",
    "Last Meeting Action Item's","Token Payout","Paid"
  ],
  safety: [
    "Submit Date","Facility","Department/Area","Safety Concern","Description",
    "Recommendations to correct/improve safety issue","Resolution",
    "Maintenance Work Order Number or type NA if no W/O",
    "Who was the safety concern escalated to",
    "Did you personally speak to the leadership",
    "Leadership update","Status"
  ],
  quality: [
    "Catch ID","Entry Date","Submitted By","Area",
    "Quality Catch","Part Number","Description","Status"
  ]
};

/* ── Page bootstrap ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', ()=>{
  if (typeof initializeSession === 'function') initializeSession();
  loadCI(); loadSafety(); loadQuality();
});

/* Add a subtle expand/collapse control beside the filter/add buttons */
function addClampToggle(tabKey) {
  const header = document.querySelector(`#tab-${tabKey} .table-header-controls`);
  const table  = document.getElementById(`${tabKey}-table`);
  if (!header || !table) return;

  let btn = header.querySelector('.table-toggle');
  if (!btn) {
    btn = document.createElement('button');
    btn.className = 'table-toggle';
    btn.type = 'button';
    header.appendChild(btn);
  }

  const setLabel = () => btn.textContent = table.classList.contains('is-expanded') ? 'Collapse rows' : 'Expand rows';
  setLabel();

  btn.onclick = () => {
    table.classList.toggle('is-expanded');
    setLabel();
  };
}

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
    addClampToggle('ci');
  }catch(e){ console.error('CI load', e); }
}

async function loadSafety(){
  try{
    const sheet = await fetchSheet(SHEET_IDS.safetyConcerns);
    renderTable({
      sheet,
      containerId: 'safety-table',
      columnOrder:  COLS.safety
    });
    addClampToggle('safety');
  }catch(e){ console.error('Safety load', e); }
}

async function loadQuality(){
  try{
    const sheet = await fetchSheet(SHEET_IDS.qualityCatches);
    renderTable({
      sheet,
      containerId: 'quality-table',
      columnOrder:  COLS.quality
    });
    addClampToggle('quality');
  }catch(e){ console.error('Quality load', e); }
}
