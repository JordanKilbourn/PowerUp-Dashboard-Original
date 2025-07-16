// scripts/loadPageComponents.js
export async function loadPageComponents() {
  // Load sidebar
  const sidebarRes = await fetch('components/sidebar.html');
  const sidebarHtml = await sidebarRes.text();
  document.getElementById('sidebar').innerHTML = sidebarHtml;

  // Load header
  const headerRes = await fetch('components/header.html');
  const headerHtml = await headerRes.text();
  document.getElementById('header').innerHTML = headerHtml;

  // Activate sidebar toggle
  const toggleBtn = document.getElementById('sidebarToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });
  }

  // Populate user info from sessionStorage
  const name = sessionStorage.getItem('userName') || 'User';
  const level = sessionStorage.getItem('userLevel') || 'Level ?';
  const month = sessionStorage.getItem('currentMonth') || 'Month ?';

  const greeting = document.getElementById('userGreeting');
  const levelEl = document.getElementById('userLevel');
  const monthEl = document.getElementById('currentMonth');

  if (greeting) greeting.textContent = `Welcome, ${name}`;
  if (levelEl) levelEl.textContent = `Level ${level}`;
  if (monthEl) monthEl.textContent = month;
}
