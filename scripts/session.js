// /scripts/session.js

function initializeSession() {
  const empID = sessionStorage.getItem("empID");
  const displayName = sessionStorage.getItem("displayName") || "User";
  const level = sessionStorage.getItem("currentLevel") || "N/A";
  const month = sessionStorage.getItem("currentMonth") || "Unknown";

  const userEl = document.getElementById("userGreeting");
  const levelEl = document.getElementById("userLevel");
  const monthEl = document.getElementById("currentMonth");

  if (userEl) userEl.textContent = displayName;
  if (levelEl) levelEl.textContent = level;
  if (monthEl) monthEl.textContent = month;

  if (!empID && !window.location.href.includes("index.html")) {
    alert("Please log in first.");
    window.location.href = "index.html";
  }
}

// 🔁 Sidebar toggling logic
function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  if (sidebar) {
    sidebar.classList.toggle("open");
  }
}

// 🚪 Logout logic
function logout() {
  if (confirm("Are you sure you want to log out?")) {
    sessionStorage.clear();
    window.location.href = "index.html";
  }
}

// 🟨 Optional: Automatically highlight sidebar item based on page
function highlightSidebar() {
  const path = window.location.pathname.split("/").pop().toLowerCase();
  document.querySelectorAll(".sidebar a[href]").forEach(link => {
    const href = link.getAttribute("href").toLowerCase();
    if (href === path) {
      link.classList.add("active");
    }
  });
}

// 👇 Call after includes are injected
function setupSidebarBehavior() {
  highlightSidebar();
  window.toggleSidebar = toggleSidebar;
  window.logout = logout;
}
