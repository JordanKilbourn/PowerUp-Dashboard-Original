// scripts/session.js

export function initializeSession() {
  const empID = sessionStorage.getItem('empID');
  const name = sessionStorage.getItem('displayName');
  if (!empID || !name) return;

  const welcome = document.getElementById('welcomeName');
  if (welcome) welcome.textContent = name;

  refreshHeaderBadges();
}

export function setSession(key, value) {
  sessionStorage.setItem(key, value);
  if (['currentLevel', 'currentMonth'].includes(key)) {
    refreshHeaderBadges();
  }
}

export function setupSidebarBehavior() {
  const toggle = document.getElementById('sidebarToggle');
  const logout = document.getElementById('logoutBtn');

  if (toggle) {
    toggle.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('collapsed');
    });
  }

  if (logout) {
    logout.addEventListener('click', () => {
      sessionStorage.clear();
      window.location.href = 'index.html';
    });
  }

  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
    if (link.href.endsWith(location.pathname)) {
      link.classList.add('active');
    }
  });
}

function refreshHeaderBadges() {
  const level = sessionStorage.getItem('currentLevel');
  const month = sessionStorage.getItem('currentMonth');

  const badgeLevel = document.getElementById('badgeLevel');
  const badgeMonth = document.getElementById('badgeMonth');

  if (badgeLevel) badgeLevel.textContent = level || '';
  if (badgeMonth) badgeMonth.textContent = month || '';
}
