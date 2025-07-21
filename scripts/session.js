function initializeSession() {
  const empID = sessionStorage.getItem("empID");
  const displayName = sessionStorage.getItem("displayName") || "User";
  const level = sessionStorage.getItem("currentLevel") || "N/A";
  const month = sessionStorage.getItem("currentMonth") || "Unknown";

  updateTextById("userGreeting", displayName);
  updateTextById("userLevel", level);
  updateTextById("currentMonth", month);

  if (!empID && !window.location.pathname.includes("index.html")) {
    alert("Please log in first.");
    window.location.href = "index.html";
  }
}

function updateTextById(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  if (sidebar) sidebar.classList.toggle("open");
}

function logout() {
  if (confirm("Are you sure you want to log out?")) {
    sessionStorage.clear();
    window.location.href = "index.html";
  }
}

function highlightSidebar() {
  const path = window.location.pathname.split("/").pop().toLowerCase();
  document.querySelectorAll(".sidebar a[href]").forEach(link => {
    const href = link.getAttribute("href").toLowerCase();
    if (href === path || (href.includes('.html') && path.includes(href.replace('.html', '')))) {
      link.classList.add("active");
    }
  });
}

function setupSidebarBehavior() {
  highlightSidebar();
  window.toggleSidebar = toggleSidebar;
  window.logout = logout;
}

initializeSession();
setupSidebarBehavior();
