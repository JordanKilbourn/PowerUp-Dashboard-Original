// /scripts/loadPageComponents.js
import { initializeSession, setupSidebarBehavior } from './session.js';

export async function loadPageComponents() {
  const sidebarEl = document.getElementById('sidebar');
  const headerEl  = document.getElementById('header');
  if (!sidebarEl || !headerEl) return console.error("Missing header/sidebar containers");

  try {
    const [sidebarHTML, headerHTML] = await Promise.all([
      fetch('/components/sidebar.html').then(r => r.text()),
      fetch('/components/header.html').then(r => r.text()),
    ]);
    sidebarEl.innerHTML = sidebarHTML;
    headerEl.innerHTML  = headerHTML;
    // 🔄 Initialize session-based values
    initializeSession();
    setupSidebarBehavior();
  } catch (err) {
    console.error("Failed to load header/sidebar:", err);
  }
}
