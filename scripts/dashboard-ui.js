// scripts/dashboard-ui.js
// Tabs for refreshed CSS (.tab-buttons / .tab-button / .tab-panel)
(function wireTabs(){
  const buttons = Array.from(document.querySelectorAll('.tab-button'));
  const panels  = Array.from(document.querySelectorAll('.tab-panel'));
  if (!buttons.length || !panels.length) return;

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
