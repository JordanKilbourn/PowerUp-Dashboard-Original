// /scripts/dashboard-ui.js

document.addEventListener("DOMContentLoaded", () => {
  loadComponents().then(() => {
    initializeSession();
    setupSidebarBehavior();
    loadDashboard();
    setupAccordionBehavior(); // Attach accordion click behavior AFTER content is loaded
  });
});

function setupAccordionBehavior() {
  document.querySelectorAll(".accordion-header").forEach(header => {
    header.addEventListener("click", () => {
      const item = header.closest(".accordion-item");
      item.classList.toggle("open");
    });
  });
}

