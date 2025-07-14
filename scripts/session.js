// scripts/session.js
function initializeSession() {
  const displayName = sessionStorage.getItem("displayName") || "User";
  const level = sessionStorage.getItem("currentLevel") || "N/A";
  const month = sessionStorage.getItem("currentMonth") || "Unknown";

  document.getElementById("userGreeting")?.textContent = displayName;
  document.getElementById("userLevel")?.textContent = level;
  document.getElementById("currentMonth")?.textContent = month;
}

function setupSidebarBehavior() {
  const sidebar = document.querySelector(".sidebar");
  document.querySelectorAll(".sidebar a").forEach(link => {
    if (link.getAttribute("onclick")?.includes("toggleSidebar")) {
      link.addEventListener("click", () => sidebar.classList.toggle("open"));
    }
    if (link.getAttribute("onclick")?.includes("logout")) {
      link.addEventListener("click", () => {
        sessionStorage.clear(); window.location.href = "index.html";
      });
    }
  });
  
  const path = window.location.pathname.split("/").pop().toLowerCase();
  document.querySelectorAll(".sidebar a[href]").forEach(link => {
    if (link.getAttribute("href").toLowerCase() === path) {
      link.classList.add("active");
    }
  });
}

// Expose globally
window.initializeSession = initializeSession;
window.setupSidebarBehavior = setupSidebarBehavior;
