// /scripts/init-dashboard.js
import { initializePage } from './layout.js';
import { loadDashboard } from './load-dashboard.js';
import { initializeAccordions } from './dashboard-ui.js';
import './session.js';

document.addEventListener("DOMContentLoaded", async () => {
  await initializePage();           // Inject sidebar + header + username
  initializeAccordions();          // Dashboard-specific UI
  loadDashboard();                 // Page-specific data logic
});
