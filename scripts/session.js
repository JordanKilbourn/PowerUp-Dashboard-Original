// scripts/session.js

function initializeSession() {
  const displayName = sessionStorage.getItem("displayName") || "User";
  const level = sessionStorage.getItem("currentLevel") || "N/A";
  const month = sessionStorage.getItem("currentMonth") || "Unknown";

  const greetingEl = document.getElementById("userGreeting");
  const levelEl = document.getElementById("userLevel");
  const monthEl = document.getElementById("currentMonth");

  if (greetingEl) greetingEl.textContent = displayName;
  if (levelEl) levelEl.textContent = level;
  if (monthEl) monthEl.textContent = month;
}

function setupSidebarBehavior() {
  const sidebar = document.querySelector(".sidebar");
  const toggleLinks = document.querySelectorAll(".sidebar a[onclick*='toggleSidebar']");
  toggleLinks.forEach(link =>
    link.addEventListener("click", () => sidebar?.classList.toggle("open"))
  );

  highlightSidebar();

  const logoutBtn = document.querySelector(".sidebar a[onclick*='logout']");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.clear();
      window.location.href = "index.html";
    });
  }
}

function highlightSidebar() {
  const path = window.location.pathname.split("/").pop().toLowerCase();
  document.querySelectorAll(".sidebar a[href]").forEach(link => {
    if (link.getAttribute("href").toLowerCase() === path) {
      link.classList.add("active");
    }
  });
}

// Export globally so other files can trigger them
window.initializeSession = initializeSession;
window.setupSidebarBehavior = setupSidebarBehavior;

