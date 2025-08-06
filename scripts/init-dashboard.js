// Dynamic loader for refreshed dashboard (CI / Safety / Quality)

// ── Imports ───────────────────────────────────────────────────
import { fetchSheet, SHEET_IDS } from './api.js';   // your existing proxy
import { renderTable }           from './table.js'; // existing helper
import './session.js';                            // provides initializeSession()

// ── Column order config ───────────────────────────────────────
const COLS = {
  ci: [
    "Submission Date","Submission ID","Problem Statements","Proposed Improvement",
    "CI Approval","Status","Action Item Entry Date","Last Meeting Action Item's",
    "Token Payout","Resourced","Paid"
  ],
  safety: [
    "Submit Date","Facility","Description","Resolution","Status"
  ],
  quality: [
    "Catch ID","Entry Date","Submitted By","Area",
    "Quality Catch","Part Number","Description"
  ]
};

// helper to map column titles → columnId
const colMap = sheet => Object.fromEntries(
  sheet.columns.map(c=>[c.title.trim().toLowerCase(),c.id])
);

// cell helper
const cell = (row,map,title) => {
  const cId = map[title.toLowerCase()];
  if(!cId) return '';
  const c   = row.cells.find(k=>k.columnId===cId)||{};
  return c.displayValue ?? c.value ?? '';
};

// after renderTable, add sortable headers
const attachSort = type => {
  document.querySelectorAll(`#${type}-table thead th`)
    .forEach((th,idx)=>{
      th.classList.add('sortable');
      th.onclick = () => sortTable(type,idx);   // uses inline helper
    });
};

// ── Page bootstrap ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded',()=>{
  if(typeof initializeSession==='function')initializeSession();  // guard + username
  loadCI(); loadSafety(); loadQuality();
});

// ── Loaders ───────────────────────────────────────────────────
async function loadCI(){
  try{
    const sheet=await fetchSheet(SHEET_IDS.ciSubmissions);
    renderTable({ sheet, containerId:'ci-table', columnOrder:COLS.ci,
                  checkmarkCols:['Resourced','Paid'] });
    filterTable('ci'); attachSort('ci');
  }catch(e){console.error('CI load',e);}
}

async function loadSafety(){
  try{
    const sheet=await fetchSheet(SHEET_IDS.safetyConcerns);
    renderTable({ sheet, containerId:'safety-table', columnOrder:COLS.safety });
    filterTable('safety'); attachSort('safety');
  }catch(e){console.error('Safety load',e);}
}

async function loadQuality(){
  try{
    const sheet=await fetchSheet(SHEET_IDS.qualityCatches);
    renderTable({ sheet, containerId:'quality-table', columnOrder:COLS.quality });
    filterTable('quality'); attachSort('quality');
  }catch(e){console.error('Quality load',e);}
}
