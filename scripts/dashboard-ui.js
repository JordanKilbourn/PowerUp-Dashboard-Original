// /scripts/dashboard-ui.js

document.addEventListener("DOMContentLoaded", () => {
  loadComponents().then(() => {
    initializeSession();
    setupSidebarBehavior(); // ✅ keep this
    loadDashboard();
    // Removed setupCollapsibles(); — it's already defined below inline
  });

// Accordion behavior
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".accordion-header").forEach(header => {
    header.addEventListener("click", () => {
      const item = header.closest(".accordion-item");
      item.classList.toggle("open");
    });
  });
});

