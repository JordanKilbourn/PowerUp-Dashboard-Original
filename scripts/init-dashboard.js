// /scripts/init-dashboard.js
import { loadDashboard } from './load-dashboard.js';
import { initializeAccordions } from './dashboard-ui.js';
import './session.js';

document.addEventListener("DOMContentLoaded", async () => {
  const sidebar = document.getElementById("sidebar");
  const header = document.getElementById("header");

  try {
    const [sidebarHTML, headerHTML] = await Promise.all([
      fetch("/components/sidebar.html").then(res => res.text()),
      fetch("/components/header.html").then(res => res.text()),
    ]);

    sidebar.innerHTML = sidebarHTML;
    header.innerHTML = headerHTML;

    // 🌟 AFTER HEADER IS INJECTED: Insert user's name
    const displayName = sessionStorage.getItem('displayName') || 'User';
    const nameEl = document.getElementById("userGreeting");
    if (nameEl) nameEl.textContent = displayName;

  } catch (err) {
    console.error("Component include failed:", err);
  }

  setTimeout(() => {
    initializeAccordions();
    loadDashboard();
  }, 0);
});
