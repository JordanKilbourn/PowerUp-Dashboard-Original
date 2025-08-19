// /scripts/load-dashboard.js
// Keeps your original structure, mapped to refreshed IDs and your clarified rules.
//
// - Power Hours: Month (1..12), Completed == true, sum Completed Hours; also compute YTD.
// - Tokens: CI Token Payout only when Paid checkbox is checked (lifetime).
// - Level: from Level Tracker (latest) -> writes to #js-header-level.
// - Progress UI writes to legacy IDs that we added in HTML: #progressBar, #phProgress, #powerTips, #tokenTotal.

import { SHEET_IDS, fetchSheet } from './api.js';

// ---------- helpers ----------
const ci = (s) => s?.trim().toLowerCase();
function getCol(sheet, name) {
  const t = ci(name);
  return sheet.columns.find(c => ci(c.title) === t) || null;
}
function getVal(row, col) {
  if (!col) return undefined;
  const cell = row.cells.find(c => c.columnId === col.id);
  return (cell?.displayValue ?? cell?.value);
}
function toNum(v) {
  if (v == null) return NaN;
  if (typeof v === 'number') return v;
  const n = parseFloat(String(v).replace(/[^0-9.\-]/g,''));
  return Number.isFinite(n) ? n : NaN;
}
function parseDate(v) {
  if (!v) return null;
  const d = new Date(String(v));
  if (!isNaN(d)) return d;
  const m = String(v).match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/);
  if (m) {
    const mm = +m[1]-1, dd = +m[2], yy = +(m[3].length===2 ? '20'+m[3] : m[3]);
    const d2 = new Date(yy,mm,dd);
    if (!isNaN(d2)) return d2;
  }
  return null;
}
function parseLevelNum(v) {
  const m = String(v ?? '').match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : NaN;
}

// ---------- main ----------
export function loadDashboard() {
  const empID = sessionStorage.getItem('empID');
  if (!empID) return;

  Promise.all([
    fetchSheet(SHEET_IDS.levelTracker),
    fetchSheet(SHEET_IDS.powerHours),
    fetchSheet(SHEET_IDS.ciSubmissions),
    fetchSheet(SHEET_IDS.dynamicGoals)
  ]).then(([levelTracker, powerHours, ciSheet, goals]) => {
    updateLevel(levelTracker);
    updatePowerHours(powerHours, levelTracker, goals);
    updateTokens(ciSheet);
  }).catch(err => console.error('Failed to load dashboard data:', err));
}

// ---------- Header: Level from Level Tracker (latest row) ----------
function updateLevel(levelTracker) {
  const empID = sessionStorage.getItem('empID');

  const colEmp   = getCol(levelTracker, 'Employee ID') || getCol(levelTracker, 'Position ID');
  const colLevel = getCol(levelTracker, 'Level');
  const colDate  = getCol(levelTracker, 'Effective Date');

  const mine = levelTracker.rows.filter(r => String(getVal(r, colEmp) ?? '').toUpperCase() === empID);
  if (!mine.length) {
    const el = document.querySelector('#js-header-level');
    if (el) el.textContent = 'No Level';
    return;
  }

  mine.sort((a,b) => {
    const na = parseLevelNum(getVal(a,colLevel));
    const nb = parseLevelNum(getVal(b,colLevel));
    if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) return nb - na;
    const da = parseDate(getVal(a,colDate)) || new Date(0);
    const db = parseDate(getVal(b,colDate)) || new Date(0);
    return db - da;
  });

  const latest = mine[0];
  const levelText = String(getVal(latest, colLevel) || '').trim() || 'No Level';
  sessionStorage.setItem('currentLevel', levelText);

  const levelEl = document.querySelector('#js-header-level');
  if (levelEl) levelEl.textContent = levelText;
}

// ---------- Power Hours: Month (1..12), Completed, Completed Hours; YTD ----------
async function updatePowerHours(powerHours, levelTracker, goalsSheet) {
  const empID = sessionStorage.getItem('empID');
  const now = new Date();
  const CUR_MONTH = now.getMonth() + 1;
  const CUR_YEAR  = now.getFullYear();

  const colEmp       = getCol(powerHours, 'Employee ID') || getCol(powerHours, 'Position ID');
  const colCompleted = getCol(powerHours, 'Completed');
  const colHours     = getCol(powerHours, 'Completed Hours') || getCol(powerHours, 'Hours');
  const colMonth     = getCol(powerHours, 'Month');      // numeric 1..12
  const colYear      = getCol(powerHours, 'Year');       // optional
  const colDate      = getCol(powerHours, 'Date');       // fallback

  const mine = powerHours.rows.filter(r => String(getVal(r,colEmp) ?? '').toUpperCase() === empID);

  // Filter for current month (and year) and require Completed==true when present
  const monthRows = mine.filter(r => {
    const m = toNum(getVal(r, colMonth));
    if (!Number.isFinite(m) || m !== CUR_MONTH) return false;
    if (colYear) {
      return String(getVal(r,colYear)) === String(CUR_YEAR);
    } else if (colDate) {
      const d = parseDate(getVal(r,colDate));
      return d ? d.getFullYear() === CUR_YEAR : true;
    }
    return true;
  }).filter(r => {
    if (!colCompleted) return true;
    const v = String(getVal(r,colCompleted) ?? '').trim().toLowerCase();
    return v === 'true' || v === 'yes' || v === '1' || v === 'x' || v === '✓';
  });

  const hrsColId = colHours?.id;
  const monthTotal = monthRows.reduce((a,r) => a + (toNum(getVal(r, {id:hrsColId})) || 0), 0);

  // YTD
  const ytdRows = mine.filter(r => {
    if (colYear) return String(getVal(r,colYear)) === String(CUR_YEAR);
    if (colDate) { const d = parseDate(getVal(r,colDate)); return d ? d.getFullYear() === CUR_YEAR : true; }
    return true;
  }).filter(r => {
    if (!colCompleted) return true;
    const v = String(getVal(r,colCompleted) ?? '').trim().toLowerCase();
    return v === 'true' || v === 'yes' || v === '1' || v === 'x' || v === '✓';
  });
  const ytdTotal = ytdRows.reduce((a,r) => a + (toNum(getVal(r, {id:hrsColId})) || 0), 0);

  // Goals by level (monthly goal)
  const colLT_Emp   = getCol(levelTracker, 'Employee ID') || getCol(levelTracker, 'Position ID');
  const colLT_Level = getCol(levelTracker, 'Level');
  const colLT_Date  = getCol(levelTracker, 'Effective Date');
  const ltMine = levelTracker.rows.filter(r => String(getVal(r,colLT_Emp) ?? '').toUpperCase() === empID);
  ltMine.sort((a,b) => {
    const na = parseLevelNum(getVal(a,colLT_Level)), nb = parseLevelNum(getVal(b,colLT_Level));
    if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) return nb - na;
    const da = parseDate(getVal(a,colLT_Date)) || new Date(0);
    const db = parseDate(getVal(b,colLT_Date)) || new Date(0);
    return db - da;
  });
  const levelNum = parseLevelNum(getVal(ltMine[0], colLT_Level));

  const colG_Level = getCol(goalsSheet, 'Level') || getCol(goalsSheet, 'PowerUp Level') || getCol(goalsSheet, 'Level Name');
  const colG_Min   = getCol(goalsSheet, 'Min')   || getCol(goalsSheet, 'Min Hours') || getCol(goalsSheet, 'Minimum');
  const colG_Max   = getCol(goalsSheet, 'Max')   || getCol(goalsSheet, 'Max Hours') || getCol(goalsSheet, 'Maximum');

  let minTarget = 8, maxTarget = 8;
  // try exact level match, else nearest numeric
  const rowsG = goalsSheet.rows || [];
  let exact = rowsG.find(r => parseLevelNum(getVal(r,colG_Level)) === levelNum);
  if (exact) {
    const mn = toNum(getVal(exact, colG_Min)), mx = toNum(getVal(exact, colG_Max));
    minTarget = Number.isFinite(mn) ? mn : minTarget;
    maxTarget = Number.isFinite(mx) ? mx : maxTarget;
  } else {
    let best = null, bestDelta = Infinity;
    for (const r of rowsG) {
      const n = parseLevelNum(getVal(r,colG_Level));
      if (!Number.isFinite(n)) continue;
      const d = Math.abs(n - (Number.isFinite(levelNum) ? levelNum : n));
      if (d < bestDelta) { best = r; bestDelta = d; }
    }
    if (best) {
      const mn = toNum(getVal(best, colG_Min)), mx = toNum(getVal(best, colG_Max));
      minTarget = Number.isFinite(mn) ? mn : minTarget;
      maxTarget = Number.isFinite(mx) ? mx : maxTarget;
    }
  }

  // ---- Bind to refreshed DOM (via legacy IDs we added) ----
  const barEl  = document.getElementById('progressBar')  || document.querySelector('.progress-bar-inner') || document.querySelector('#js-ph-bar');
  const phEl   = document.getElementById('phProgress')   || document.querySelector('#js-ph-hours');
  const tipsEl = document.getElementById('powerTips')    || document.querySelector('#js-ph-msg');
  const goalEl = document.querySelector('#js-ph-goal');
  const ytdEl  = document.querySelector('#js-ph-ytd');

  const pct = Math.max(0, Math.min(100, (monthTotal / (maxTarget || minTarget || 1)) * 100));
  if (barEl) {
    barEl.style.width = pct + '%';
    barEl.setAttribute('aria-valuenow', Math.round(pct));
    // dynamic color like your old app
    let state = 'under', color = '#60a5fa'; // blue
    if (monthTotal >= minTarget && monthTotal <= maxTarget) { state = 'met';  color = '#4ade80'; } // green
    if (monthTotal >  maxTarget)                                 { state = 'over'; color = '#facc15'; } // amber
    barEl.dataset.state = state;
    barEl.style.backgroundColor = color; // inline wins over CSS var
  }
  if (phEl)   phEl.textContent = `${monthTotal.toFixed(1)} / ${minTarget}`;
  if (goalEl) goalEl.textContent = `${minTarget}–${maxTarget} hrs`;
  if (ytdEl)  ytdEl.textContent  = `YTD: ${ytdTotal.toFixed(1)} hrs`;

  if (tipsEl) {
    if (monthTotal > maxTarget) {
      tipsEl.textContent = `Target exceeded by ${(monthTotal - maxTarget).toFixed(1)} hrs. Nice work!`;
    } else if (monthTotal >= minTarget) {
      tipsEl.textContent = `Target met! ${monthTotal.toFixed(1)} hrs this month.`;
    } else {
      const end = new Date(now.getFullYear(), now.getMonth()+1, 0);
      const daysLeft = Math.max(0, Math.ceil((end - now) / 86400000));
      const remain = Math.max(0, minTarget - monthTotal);
      const perDay = daysLeft ? (remain / daysLeft) : remain;
      tipsEl.textContent = `Need ${remain.toFixed(1)} hrs in ${daysLeft} days (~${perDay.toFixed(1)}/day).`;
    }
  }

  // Also store current total if other modules use it
  sessionStorage.setItem('powerHours', monthTotal.toFixed(1));
}

// ---------- Tokens: lifetime total where Paid is checked ----------
function updateTokens(ciSheet) {
  const empID = sessionStorage.getItem('empID');

  const colEmp   = getCol(ciSheet, 'Employee ID') || getCol(ciSheet, 'Position ID');
  const colPaid  = getCol(ciSheet, 'Paid');
  const colPayout= getCol(ciSheet, 'Token Payout');

  let total = 0;
  for (const row of ciSheet.rows) {
    const matches = String(getVal(row,colEmp) ?? '').toUpperCase() === empID;
    if (!matches) continue;
    const paid = String(getVal(row,colPaid) ?? '').toLowerCase();
    const isPaid = paid === 'true' || paid === 'yes' || paid === '1' || paid === 'x' || paid === '✓';
    if (!isPaid) continue;
    const pts = toNum(getVal(row,colPayout));
    if (Number.isFinite(pts)) total += pts;
  }

  const el = document.getElementById('tokenTotal') || document.querySelector('#js-token-total');
  if (el) el.textContent = String(Math.round(total));
}
