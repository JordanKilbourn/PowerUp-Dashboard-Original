// /scripts/session.js

function initializeSession() {
  const empID = sessionStorage.getItem("empID");
  const displayName = sessionStorage.getItem("displayName") || "User";
  const level = sessionStorage.getItem("currentLevel") || "N/A";
  const month = sessionStorage.getItem("currentMonth") || "Unknown";

  // Update UI if elements exist
  updateTextById("userGreeting", displayName);
  updateTextById("userLevel", level);
  updateTextById("currentMonth", month);

  // Redirect if not authenticated
  if (!empID && !window.location.pathname.includes("index.html")) {
    alert("Please log in first.");
    window.location.href = "index.html";
  }
}

/**
 * Update element textContent by ID if it exists
 * @param {string} id 
 * @param {string} text 
 */
function updateTextById(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

/**
 * Toggle sidebar open/close class
 */
function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  if (sidebar) {
    sidebar.classList.toggle("open");
  }
}

/**
 * Log out and redirect
 */
function logout() {
  if (confirm("Are you sure you want to log out?")) {
    sessionStorage.clear();
    window.location.href = "index.html";
  }
}

/**
 * Highlight active page link in sidebar
 */
function highlightSidebar() {
  const path = window.location.pathname.split("/").pop().toLowerCase();
  document.querySelectorAll(".sidebar a[href]").forEach(link => {
    if (link.getAttribute("href").toLowerCase() === path) {
      link.classList.add("active");
    }
  });
}

/**
 * Setup sidebar-related features and window-accessible handlers
 */
function setupSidebarBehavior() {
  highlightSidebar();
  window.toggleSidebar = toggleSidebar;
  window.logout = logout;
}

// 🔁 INIT SESSION + SIDEBAR LOGIC
initializeSession();
setupSidebarBehavior();
