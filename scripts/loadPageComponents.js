// scripts/loadPageComponents.js
import { initializeSession, setupSidebarBehavior } from './session.js';

// Loads header + sidebar HTML fragments, then preps session UI
export async function loadPageComponents() {
  // Compute base path to /components/ regardless of nesting depth
  const base = location.pathname.replace(/\/[^/]*$/, '/components/');

  try {
    const [headerHTML, sidebarHTML] = await Promise.all([
      fetch(`${base}header.html`).then(r => r.text()),
      fetch(`${base}sidebar.html`).then(r => r.text())
    ]);

    document.getElementById('header').innerHTML  = headerHTML;
    document.getElementById('sidebar').innerHTML = sidebarHTML;

    initializeSession();
    setupSidebarBehavior();
  } catch (err) {
    console.error('Component load failed', err);
    document.getElementById('header').textContent =
      '⚠️ Error loading layout – see console';
  }
}
