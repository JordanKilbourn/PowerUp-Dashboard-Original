// ui-adapter.js
// Map your refreshed DOM -> legacy data-hook IDs, without changing classes or CSS.
// Safe to run multiple times; only sets IDs if missing.

(function attachLegacyIds() {
  try {
    // ----- Power Hours card -----
    // Fill bar: .power-card .progress-bar .progress-bar-fill  => #progressBar
    const phFill = document.querySelector('.power-card .progress-bar .progress-bar-fill');
    if (phFill && !phFill.id) phFill.id = 'progressBar';

    // Text "HOURS / TARGET": prefer a <strong> inside power-card; fallback to first h3 sibling text container
    let phText = document.querySelector('.power-card strong');
    if (!phText) {
      // create one just before the bar if missing
      const bar = document.querySelector('.power-card .progress-bar');
      if (bar) {
        phText = document.createElement('strong');
        phText.textContent = '0 / 8';
        bar.parentNode.insertBefore(phText, bar);
      }
    }
    if (phText && !phText.id) phText.id = 'phProgress';

    // Smart message paragraph
    let phTips = document.querySelector('.power-card p#powerTips') || document.querySelector('.power-card p');
    if (phTips && !phTips.id) phTips.id = 'powerTips';

    // ----- Tokens card -----
    // Value: .token-card .token-tracker span => #tokenTotal
    const tokenSpan = document.querySelector('.token-card .token-tracker span');
    if (tokenSpan && !tokenSpan.id) tokenSpan.id = 'tokenTotal';

    // ----- Tabs & tables -----
    // Panels in order: CI, Safety, Quality (based on your refreshed layout)
    const panels = Array.from(document.querySelectorAll('.tab-panels .tab-panel'));
    if (panels.length >= 3) {
      // Helper to set IDs inside a panel
      const wirePanel = (panel, cfg) => {
        // Select filter
        const sel = panel.querySelector('select');
        if (sel && !sel.id) sel.id = cfg.filterId;

        // Count pill
        const count = panel.querySelector('.row-count') || panel.querySelector('span');
        if (count && !count.id) count.id = cfg.countId;

        // Table
        // Prefer an explicit table element, else create one
        let table = panel.querySelector('table');
        if (!table) {
          const wrapper = document.createElement('div');
          wrapper.className = 'table-scroll';
          table = document.createElement('table');
          wrapper.appendChild(table);
          panel.appendChild(wrapper);
        }
        if (!table.id) table.id = cfg.tableId;
        if (!table.classList.contains('dashboard-table')) table.classList.add('dashboard-table');
      };

      wirePanel(panels[0], { filterId: 'ciStatusFilter',     countId: 'ciSubmissionCount',     tableId: 'ciSubmissionsTable' });
      wirePanel(panels[1], { filterId: 'safetyStatusFilter', countId: 'safetySubmissionCount', tableId: 'safetyTable' });
      wirePanel(panels[2], { filterId: 'qcStatusFilter',     countId: 'qcSubmissionCount',     tableId: 'qcTable' });
    }

    // ----- Header IDs for data (display name + level) -----
    // Your refreshed header shows "Welcome: <span id='userGreeting'>…</span> Level: <span id='userLevel'>…</span>"
    // If the IDs are missing, add them without changing markup.
    const greetSpan = document.querySelector('.header #userGreeting') || document.querySelector('.header p span');
    if (greetSpan && !greetSpan.id) greetSpan.id = 'userGreeting';

    const levelSpan = document.querySelector('.header #userLevel') ||
                      Array.from(document.querySelectorAll('.header p span')).slice(-1)[0];
    if (levelSpan && !levelSpan.id) levelSpan.id = 'userLevel';

  } catch (e) {
    console.error('ui-adapter failed:', e);
  }
})();

// Optional: minimal tab behavior if none exists
(function ensureTabsWork(){
  const buttons = Array.from(document.querySelectorAll('.tab-btn'));
  const panels  = Array.from(document.querySelectorAll('.tab-panel'));
  if (!buttons.length || !panels.length) return;

  // If no data-tab attributes present, assign based on order to avoid changing HTML classes
  const names = ['ci','safety','quality'];
  buttons.forEach((b, i) => { if (!b.dataset.tab) b.dataset.tab = names[i] || `tab${i}`; });
  panels.forEach((p, i) => { if (!p.id) p.id = `tab-${names[i] || `tab${i}`}`; });

  function activate(name){
    buttons.forEach(b => b.classList.toggle('active', b.dataset.tab === name));
    panels.forEach(p => p.classList.toggle('active', p.id === `tab-${name}`));
  }
  buttons.forEach(b => b.addEventListener('click', () => activate(b.dataset.tab)));
  const defaultTab = buttons.find(b => b.classList.contains('active'))?.dataset.tab || names[0];
  activate(defaultTab);
})();
