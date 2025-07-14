// /scripts/loadPageComponents.js
import './session.js';

/**
 * Loads header and sidebar HTML into the page
 * Ensures session init and sidebar behavior scripts are ready
 */
export async function loadPageComponents() {
  const sidebarEl = document.getElementById('sidebar');
  const headerEl = document.getElementById('header');

  if (!sidebarEl || !headerEl) {
    console.error("Missing #sidebar or #header elements in HTML");
    return;
  }

  try {
    const [sidebarHTML, headerHTML] = await Promise.all([
      fetch('/components/sidebar.html').then(res => res.text()),
      fetch('/components/header.html').then(res => res.text()),
    ]);

    sidebarEl.innerHTML = sidebarHTML;
    headerEl.innerHTML = headerHTML;

    // Reinitialize session behaviors after injecting header/sidebar
    window.initializeSession?.();
    window.setupSidebarBehavior?.();

  } catch (err) {
    console.error("Failed to load page components:", err);
  }
}
