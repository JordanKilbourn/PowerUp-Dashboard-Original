// /scripts/session.js

function initializeSession() {
  const empID = sessionStorage.getItem("empID");
  const displayName = sessionStorage.getItem("displayName") || "User";
  const userLevel = sessionStorage.getItem("currentLevel") || "N/A";
  const currentMonth = sessionStorage.getItem("currentMonth") || "Unknown";

  // 🔐 Redirect if not logged in
  if (!empID) {
    alert("Please log in first.");
    window.location.href = "index.html";
    return;
  }

  // 👋 Populate header spans
  const greetEl = document.getElementById("userGreeting");
  const levelEl = document.getElementById("userLevel");
  const monthEl = document.getElementById("currentMonth");

  if (greetEl) greetEl.textContent = displayName;
  if (levelEl) levelEl.textContent = userLevel;
  if (monthEl) monthEl.textContent = currentMonth;

  // 🌟 Highlight active link in sidebar
  const path = window.location.pathname.split("/").pop().toLowerCase();
  document.querySelectorAll(".sidebar a[href]").forEach(link => {
    const href = link.getAttribute("href").toLowerCase();
    if (href === path) {
      link.classList.add("active");
    }
  });

  // 📤 Enable sidebar toggle and logout globally
  window.toggleSidebar = () => {
    const sidebar = document.getElementById("sidebar");
    const container = document.querySelector(".container");
    if (sidebar && container) {
      sidebar.classList.toggle("open");
      container.style.marginLeft = sidebar.classList.contains("open") ? "220px" : "60px";
    }
  };

  window.logout = () => {
    if (confirm("Are you sure you want to log out?")) {
      sessionStorage.clear();
      window.location.href = "index.html";
    }
  };
}

