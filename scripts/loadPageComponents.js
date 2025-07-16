// scripts/loadPageComponents.js

export async function loadPageComponents() {
  try {
    const sidebar = document.getElementById('sidebar');
    const header = document.getElementById('header');

    if (!sidebar || !header) {
      console.warn('Sidebar or header container not found.');
      return;
    }

    const [sidebarHTML, headerHTML] = await Promise.all([
      fetch('./components/sidebar.html').then(res => res.text()),
      fetch('./components/header.html').then(res => res.text()),
    ]);

    sidebar.innerHTML = sidebarHTML;
    header.innerHTML = headerHTML;

    // Dynamically import session logic
    const { initializeSession, setupSidebarBehavior } = await import('./session.js');
    initializeSession();
    setupSidebarBehavior();

  } catch (err) {
    console.error('Failed to load sidebar or header:', err);
  }
}
