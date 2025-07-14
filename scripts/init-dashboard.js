// /scripts/init-dashboard.js
import { loadDashboard } from './load-dashboard.js';
import { initializeAccordions } from './dashboard-ui.js';
import './session.js'; // no export needed; it runs on load

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
  } catch (err) {
    console.error("Component include failed:", err);
  }

  // Wait for DOM insertion before initializing behavior
  setTimeout(() => {
    initializeAccordions();
    loadDashboard();
  }, 0);
});
