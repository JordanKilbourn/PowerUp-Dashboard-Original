// /scripts/init-dashboard.js
import { loadDashboard } from './load-dashboard.js';
import { initializeAccordions } from './dashboard-ui.js';
import './session.js';

document.addEventListener("DOMContentLoaded", async () => {
  const sidebar = document.getElementById("sidebar");
  const header = document.getElementById("header");

  try {
    // 🧩 Load components dynamically
    const [sidebarHTML, headerHTML] = await Promise.all([
      fetch("/components/sidebar.html").then(res => {
        if (!res.ok) throw new Error("Sidebar include failed");
        return res.text();
      }),
      fetch("/components/header.html").then(res => {
        if (!res.ok) throw new Error("Header include failed");
        return res.text();
      }),
    ]);

    // Inject HTML into placeholders
    if (sidebar) sidebar.innerHTML = sidebarHTML;
    if (header) header.innerHTML = headerHTML;

    // Wait one tick for DOM updates
    await new Promise(r => setTimeout(r, 0));

    // Populate user greeting from session
    const displayName = sessionStorage.getItem('displayName') || 'User';
    const nameEl = document.getElementById("userGreeting");
    if (nameEl) nameEl.textContent = displayName;

    // Load interactive UI behaviors
    initializeAccordions();
    loadDashboard();

  } catch (err) {
    console.error("❌ Component loading failed:", err);
  }
});
