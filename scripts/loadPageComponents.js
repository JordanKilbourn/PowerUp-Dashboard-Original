// scripts/loadPageComponents.js
import './session.js';

export async function loadPageComponents() {
  const sidebarEl = document.getElementById('sidebar');
  const headerEl = document.getElementById('header');
  if (!sidebarEl || !headerEl) {
    console.error("Missing #sidebar or #header in HTML");
    return;
  }

  try {
    const [sidebarHTML, headerHTML] = await Promise.all([
      fetch('/components/sidebar.html').then(r => r.text()),
      fetch('/components/header.html').then(r => r.text()),
    ]);

    sidebarEl.innerHTML = sidebarHTML;
    headerEl.innerHTML = headerHTML;

    window.initializeSession();
    window.setupSidebarBehavior();
  } catch (err) {
    console.error("Failed to load header/sidebar:", err);
  }
}
