// scripts/loadPageComponents.js
import { initializeSession, setupSidebarBehavior } from './session.js';

/**
 * Inject header + sidebar fragments, then wire up
 * session display and sidebar behaviour.
 * Uses purely relative paths so the code works no matter
 * where the site is hosted (root or sub-folder).
 */
export async function loadPageComponents() {
  try {
    const [headerHTML, sidebarHTML] = await Promise.all([
      fetch('components/header.html').then(r => r.text()),
      fetch('components/sidebar.html').then(r => r.text())
    ]);

    document.getElementById('header').innerHTML  = headerHTML;
    document.getElementById('sidebar').innerHTML = sidebarHTML;

    initializeSession();
    setupSidebarBehavior();
  } catch (err) {
    console.error('Component load failed', err);
    document.getElementById('header').textContent =
      '⚠️ Error loading layout (see console)';
  }
}
