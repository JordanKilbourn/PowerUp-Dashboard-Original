// scripts/loadPageComponents.js
import './session.js';

/**
 * Loads header and sidebar HTML into the page
 * Ensures session and sidebar logic is wired
 */
export async function loadPageComponents() {
  const sidebarEl = document.getElementById('sidebar');
  const headerEl = document.getElementById('header');
  if (!sidebarEl || !headerEl) return;

  try {
    const [sHTML, hHTML] = await Promise.all([
      fetch('/components/sidebar.html').then(r => r.text()),
      fetch('/components/header.html').then(r => r.text())
    ]);
    sidebarEl.innerHTML = sHTML;
    headerEl.innerHTML = hHTML;

    window.initializeSession?.();
    window.setupSidebarBehavior?.();
  } catch (err) {
    console.error('Failed to load header/sidebar:', err);
  }
}
