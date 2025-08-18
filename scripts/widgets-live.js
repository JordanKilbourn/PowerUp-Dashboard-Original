<script>
(function(global){
  const CFG = global.PU_WIDGETS_CFG || {};
  const cache = new Map();
  let EMP_ID = null;

  // ---- utils ----
  const q = (s) => document.querySelector(s);
  const setText = (s, v) => { const el = q(s); if (el) el.textContent = v ?? ''; };
  const setWidth = (s, pct) => { const el = q(s); if (el) el.style.width = pct; };
  const toNum = (v) => {
    if (v == null) return NaN;
    if (typeof v === 'number') return v;
    const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ''));
    return Number.isFinite(n) ? n : NaN;
  };
  const parseDate = (v) => {
    if (!v) return null;
    if (v instanceof Date) return v;
    const iso = new Date(String(v));
    if (!isNaN(iso)) return iso;
    const m = String(v).match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/);
    if (m) {
      const mm = +m[1]-1, dd = +m[2], yy = +(m[3].length===2 ? '20'+m[3] : m[3]);
      const d = new Date(yy, mm, dd);
      if (!isNaN(d)) return d;
    }
    return null;
  };
  const yymm = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  const monthEnd = (d) => new Date(d.getFullYear(), d.getMonth()+1, 0, 23,59,59,999);

  // ---- storage / identity ----
  function ensureEmp(){
    if (EMP_ID) return EMP_ID;
    EMP_ID = new URLSearchParams(location.search).get('emp')
          || localStorage.getItem('PU_EMP_ID')
          || prompt('Enter Employee ID:');
    if (EMP_ID) localStorage.setItem('PU_EMP_ID', EMP_ID);
    return EMP_ID;
  }

  // ---- transport (flatten-aware) ----
  async function fetchSheetFlat(sheetId){
    if (cache.has(sheetId)) return cache.get(sheetId);
    const res = await fetch(`${CFG.baseUrl}/api/sheets/${sheetId}?flatten=1`, { credentials:'include' });
    if (!res.ok) throw new Error('Fetch failed '+res.status);
    const data = await res.json();
    let rows = data.rows;
    if (!Array.isArray(rows) && data.columns && Array.isArray(data.rows)){
      const titleById = Object.fromEntries(data.columns.map(c => [c.id, c.title]));
      rows = data.rows.map(r => {
        const o = {};
        r.cells.forEach(cell => {
          const t = titleById[cell.columnId] || cell.columnId;
          o[t] = cell.displayValue ?? cell.value ?? '';
        });
        return o;
      });
    }
    cache.set(sheetId, rows || []);
    return rows || [];
  }

  // ---- lookups ----
  async function getEmployeeRow(){
    const rows = await fetchSheetFlat(CFG.sheets.employeeMaster);
    const idCol = CFG.columns.employeeId;
    const id = ensureEmp();
    return rows.find(r => String(r[idCol] ?? '') === String(id)) || null;
  }

  function parseLevelNum(v){
    const m = String(v ?? '').match(/(\d+(?:\.\d+)?)/);
    return m ? parseFloat(m[1]) : NaN;
  }

  async function getCurrentLevelFromTracker(){
    const rows = await fetchSheetFlat(CFG.sheets.levelTracker);
    const id = ensureEmp();
    const empCol = CFG.columns.phEmpCol === 'Position ID' ? 'Position ID' : 'Employee ID';
    const lvlCol = CFG.columns.goalsLevelCol || 'Level';
    const dateCol = 'Effective Date';
    const mine = rows.filter(r => String(r[empCol] ?? '') === String(id));
    if (!mine.length) return { levelText: '', levelNum: NaN };
    mine.sort((a,b) => {
      const na = parseLevelNum(a[lvlCol]), nb = parseLevelNum(b[lvlCol]);
      if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) return nb - na;
      const da = parseDate(a[dateCol]) || new Date(0);
      const db = parseDate(b[dateCol]) || new Date(0);
      return db - da;
    });
    const top = mine[0];
    return { levelText: String(top[lvlCol] ?? ''), levelNum: parseLevelNum(top[lvlCol]) };
  }

  async function getPHForMonth(target){
    const rows = await fetchSheetFlat(CFG.sheets.powerHours);
    const id = ensureEmp();
    const empCol = CFG.columns.phEmpCol;
    const hoursCol = CFG.columns.phHoursCol;
    const mCol = CFG.columns.phMonthCol;
    const dCol = CFG.columns.phDateCol;
    const key = yymm(target);
    let list = [];

    if (rows.some(r => r[mCol] != null)) {
      list = rows.filter(r => String(r[empCol] ?? '') === String(id))
                 .filter(r => {
                   const mv = r[mCol]; if (!mv) return false;
                   const s = String(mv);
                   if (/^\d{4}-\d{2}$/.test(s)) return s === key;
                   const dt = parseDate(mv);
                   return dt && dt.getFullYear() === target.getFullYear() && dt.getMonth() === target.getMonth();
                 });
    } else if (rows.some(r => r[dCol] != null)) {
      list = rows.filter(r => String(r[empCol] ?? '') === String(id))
                 .filter(r => {
                   const dt = parseDate(r[dCol]);
                   return dt && dt.getFullYear() === target.getFullYear() && dt.getMonth() === target.getMonth();
                 });
    } else {
      list = rows.filter(r => String(r[empCol] ?? '') === String(id));
    }

    const total = list.reduce((a,r) => a + (toNum(r[CFG.columns.phHoursCol]) || 0), 0);
    return { total, rows: list };
  }

  async function getGoalsForLevel(levelNum){
    const rows = await fetchSheetFlat(CFG.sheets.dynamicGoals);
    const lvlCol = CFG.columns.goalsLevelCol, minCol = CFG.columns.goalsMinCol, maxCol = CFG.columns.goalsMaxCol;
    let best = null, bestDelta = Infinity;
    for (const r of rows) {
      const n = parseLevelNum(r[lvlCol]);
      if (Number.isFinite(n)) {
        const d = Math.abs(n - levelNum);
        if (d < bestDelta) { best = r; bestDelta = d; }
      }
    }
    if (!best) return { min: CFG.defaults.minHours, max: CFG.defaults.maxHours };
    const min = toNum(best[minCol]), max = toNum(best[maxCol]);
    return {
      min: Number.isFinite(min) ? min : CFG.defaults.minHours,
      max: Number.isFinite(max) ? max : CFG.defaults.maxHours
    };
  }

  function smartMsg(total, min, max){
    const now = new Date();
    const end = monthEnd(now);
    const days = Math.max(0, Math.ceil((end - now) / 86400000));
    if (total >= max) return { text: `Target exceeded by ${(total-max).toFixed(1)} hrs. Nice work!`, variant: 'over' };
    if (total >= min) return { text: `Target met! ${total.toFixed(1)} hrs this month.`, variant: 'met' };
    const remain = Math.max(0, min - total);
    const perDay = days ? (remain/days) : remain;
    return { text: `Need ${remain.toFixed(1)} hrs in ${days} days (~${perDay.toFixed(1)}/day).`, variant: 'under' };
  }

  async function calcTokens(){
    if (!CFG.tokens?.enabled) return { month: 0, total: 0 };
    const id = ensureEmp();
    const cur = yymm(new Date());
    let total = 0, month = 0;

    for (const src of (CFG.tokens.sources || [])){
      const rows = await fetchSheetFlat(CFG.sheets[src.sheetKey]);
      const list = rows
        .filter(r => String(r[src.empCol] ?? '') === String(id))
        .filter(r => !src.statusCol || String(r[src.statusCol] ?? '').toLowerCase() === String(src.approvedValue ?? '').toLowerCase());

      for (const r of list){
        const pts = toNum(r[src.pointsCol]);
        if (!Number.isFinite(pts)) continue;
        total += pts;
        const dc = (r[src.dateCol] != null ? src.dateCol : CFG.columns.dateColGeneric);
        const dt = r[dc];
        const key = (typeof dt === 'string' && /^\d{4}-\d{2}$/.test(dt)) ? dt : (parseDate(dt) ? yymm(parseDate(dt)) : null);
        if (key === cur) month += pts;
      }
    }
    return { month, total };
  }

  // ---- public API ----
  const API = {
    init(opts = {}) {
      const given = String(opts.employeeId || '').trim();
      if (given) { EMP_ID = given; localStorage.setItem('PU_EMP_ID', EMP_ID); }
      else ensureEmp();
      return API;
    },

    // Header: Name + Level (fast path from Employee Master)
    async renderHeader(){
      const emp = await getEmployeeRow();
      if (emp) setText(CFG.selectors.headerName, emp[CFG.columns.employeeName] || '');

      let levelText = '';
      try {
        const sheetKey = CFG.columns.headerLevelSourceSheetKey || 'employeeMaster';
        const sheetId = CFG.sheets[sheetKey];
        const rows = sheetId ? await fetchSheetFlat(sheetId) : [];
        const id = ensureEmp();
        const row = rows.find(r => String(r[CFG.columns.employeeId] ?? '') === String(id));
        levelText = row ? (row[CFG.columns.headerLevelColumn] ?? '') : '';
      } catch {}
      setText(CFG.selectors.headerLevel, (String(levelText || '').trim()) || 'No Level');
    },

    // Power Hours: total vs goal, progress bar, smart message
    async renderPowerHours(){
      const tracker = await getCurrentLevelFromTracker();                // numeric for goals
      const goals = await getGoalsForLevel(tracker.levelNum);
      const { total } = await getPHForMonth(new Date());

      setText(CFG.selectors.phCount, `${total.toFixed(1)} / ${goals.min.toFixed(1)}`);
      const pct = Math.max(0, Math.min(100, (total / goals.max) * 100));
      setWidth(CFG.selectors.phBar, pct + '%');

      const msg = smartMsg(total, goals.min, goals.max);
      setText(CFG.selectors.phMsg, msg.text);
      const bar = q(CFG.selectors.phBar);
      if (bar) bar.dataset.state = msg.variant;

      // optional: show "8–12 hrs"
      const goalEl = q(CFG.selectors.phGoal);
      if (goalEl) goalEl.textContent = `${goals.min}–${goals.max} hrs`;

      return { total, goals, state: msg.variant };
    },

    // Tokens: lifetime + this month
    async renderTokens(){
      const t = await calcTokens();
      setText(CFG.selectors.tokenTotal, String(t.total));
      setText(CFG.selectors.tokenMonth, String(t.month));
      const msgEl = q(CFG.selectors.tokenMsg);
      if (msgEl) msgEl.textContent = t.month > 0 ? `+${t.month} this month` : 'No new tokens this month';
      return t;
    }
  };

  global.PUWidgets = API;
})(window);
</script>
