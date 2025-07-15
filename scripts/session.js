/* scripts/session.js
   — central session helpers + auto-refreshing header badges */

export function setSession(key, value) {
  sessionStorage.setItem(key, value);

  // Auto-refresh header if one of the badge fields changed
  if (['displayName', 'currentLevel', 'currentMonth', 'empID'].includes(key)) {
    refreshHeaderBadges();        // safe even if header isn’t on the page yet
  }
}

export const getSession = key => sessionStorage.getItem(key);

/* Called once, immediately after header/sidebar injection */
export function initializeSession() {
  refreshHeaderBadges();
}

/* ---------- private ---------- */
function refreshHeaderBadges() {
  const nameEl  = document.getElementById('userGreeting');
  const lvlEl   = document.getElementById('userLevel');
  const moEl    = document.getElementById('currentMonth');
  if (!nameEl || !lvlEl || !moEl) return;   // header not injected yet

  const name  = getSession('displayName')  ?? getSession('empID') ?? 'User';
  const level = getSession('currentLevel') ?? '—';
  const month = getSession('currentMonth') ?? 'Unknown';

  nameEl.textContent = `Welcome, ${name}`;
  lvlEl.textContent  = level;
  moEl.textContent   = month;
}

/* ---------- sidebar behaviour (unchanged) ---------- */
export function setupSidebarBehavior() {
  const sidebar = document.getElementById('sidebar');
  document.getElementById('sidebarToggle')
          ?.addEventListener('click', () => sidebar.classList.toggle('open'));
  document.getElementById('logoutLink')
          ?.addEventListener('click', () => {
            sessionStorage.clear();
            window.location.href = 'index.html';
          });

  const path = location.pathname.split('/').pop();
  sidebar.querySelectorAll('.nav-link').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
}
