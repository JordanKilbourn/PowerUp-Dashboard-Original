// scripts/session.js
// Thin, shared session + sidebar helpers

/* ---------- session helpers ---------- */
export const setSession = (k, v) => sessionStorage.setItem(k, v);
export const getSession = k => sessionStorage.getItem(k);

export function initializeSession() {
  const name  = getSession('displayName')  ?? getSession('empID') ?? 'User';
  const level = getSession('currentLevel') ?? '—';
  const month = getSession('currentMonth') ??
        new Date().toLocaleString('default', { month: 'long' });

  document.getElementById('userGreeting').textContent = `Welcome, ${name}`;
  document.getElementById('userLevel').textContent    = level;
  document.getElementById('currentMonth').textContent = month;
}

/* ---------- sidebar behaviour ---------- */
export function setupSidebarBehavior() {
  const sidebar = document.getElementById('sidebar');
  document.getElementById('sidebarToggle')
          ?.addEventListener('click', () => sidebar.classList.toggle('open'));

  document.getElementById('logoutLink')
          ?.addEventListener('click', () => {
            sessionStorage.clear();
            window.location.href = 'index.html';
          });

  // Highlight current page link
  const path = location.pathname.split('/').pop();
  sidebar.querySelectorAll('.nav-link').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
}
