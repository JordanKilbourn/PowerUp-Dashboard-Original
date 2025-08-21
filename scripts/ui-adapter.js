// scripts/ui-adapter.js
// Assign legacy data-hook IDs to your refreshed DOM without changing classes/CSS.

(function attachLegacyIds() {
  try {
    // Power Hours bar fill: .progress-bar-inner => #progressBar
    const phFill = document.querySelector('.power-card .progress-bar .progress-bar-inner');
    if (phFill && !phFill.id) phFill.id = 'progressBar';

    // Text "HOURS / TARGET": use first <strong> in power-card => #phProgress
    let phText = document.querySelector('.power-card strong');
    if (!phText) {
      const bar = document.querySelector('.power-card .progress-bar');
      if (bar) {
        phText = document.createElement('strong');
        phText.textContent = '0 / 8';
        bar.parentNode.insertBefore(phText, bar);
      }
    }
    if (phText && !phText.id) phText.id = 'phProgress';

    // Smart message paragraph => #powerTips
    let phTips = document.querySelector('.power-card p#powerTips') || document.querySelector('.power-card p');
    if (phTips && !phTips.id) phTips.id = 'powerTips';

    // Tokens value
    const tokenSpan = document.querySelector('.token-card .token-tracker span');
    if (tokenSpan && !tokenSpan.id) tokenSpan.id = 'tokenTotal';

    // CI / Safety / Quality panels
    const panels = Array.from(document.querySelectorAll('.tab-panels .tab-panel'));
    if (panels.length >= 3) {
      const wirePanel = (panel, cfg) => {
        const sel = panel.querySelector('select');
        if (sel && !sel.id) sel.id = cfg.filterId;

        const count = panel.querySelector('.row-count') || panel.querySelector('span');
        if (count && !count.id) count.id = cfg.countId;

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

    // Header IDs (display name + level) if missing
    const greetSpan = document.querySelector('.header #userGreeting') || document.querySelector('.header p span');
    if (greetSpan && !greetSpan.id) greetSpan.id = 'userGreeting';
    const levelSpan = document.querySelector('.header #userLevel') ||
                      Array.from(document.querySelectorAll('.header p span')).slice(-1)[0];
    if (levelSpan && !levelSpan.id) levelSpan.id = 'userLevel';
  } catch (e) {
    console.error('ui-adapter failed:', e);
  }
})();
