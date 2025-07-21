async function initializePage() {
  const sidebar = document.getElementById('sidebar');
  const header = document.getElementById('header');
  if (!sidebar || !header) {
    console.error('Sidebar or header container not found');
    return;
  }

  try {
    const [sidebarHtml, headerHtml] = await Promise.all([
      fetch('/components/sidebar.html').then(res => res.text()),
      fetch('/components/header.html').then(res => res.text())
    ]);

    sidebar.innerHTML = sidebarHtml;
    header.innerHTML = headerHtml;

    // Initialize session and sidebar behavior
    import('./session.js').then(module => {
      module.setupSidebarBehavior();
      module.initializeSession();
    });
  } catch (err) {
    console.error('Failed to load layout components:', err);
  }
}

// Call initializePage on DOM load
document.addEventListener('DOMContentLoaded', initializePage);
