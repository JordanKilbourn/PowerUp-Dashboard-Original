import { loadPageComponents } from './loadPageComponents.js';
import { initializeAccordions } from './dashboard-ui.js';
import { loadDashboard } from './load-dashboard.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadPageComponents();
  initializeAccordions();
  loadDashboard();
});
