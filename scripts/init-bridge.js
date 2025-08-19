// /scripts/init-bridge.js
// Tiny bootstrap so the dashboard loads header/PH/tokens using load-dashboard.js.
import { loadDashboard } from './load-dashboard.js';

document.addEventListener('DOMContentLoaded', () => {
  try { loadDashboard(); } catch (e) { console.error(e); }
});
