// scripts/dashboard-ui.js
(function wireTabs(){
  const buttons = Array.from(document.querySelectorAll('.tab-btn'));
  const panels  = Array.from(document.querySelectorAll('.tab-panel'));
  if (!buttons.length || !panels.length) return;

  function activate(name){
    buttons.forEach(b => b.classList.toggle('active', b.dataset.tab === name));
    panels.forEach(p => p.classList.toggle('active', p.id === `tab-${name}`));
  }
  buttons.forEach(b => b.addEventListener('click', () => activate(b.dataset.tab)));
  const defaultTab = buttons.find(b => b.classList.contains('active'))?.dataset.tab || 'ci';
  activate(defaultTab);
})();
