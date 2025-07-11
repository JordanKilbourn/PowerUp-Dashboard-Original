// /scripts/dashboard-ui.js

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".collapsible-header").forEach(header => {
    header.addEventListener("click", () => {
      const section = header.closest(".collapsible-section");
      const body = section.querySelector(".collapsible-body");
      const icon = header.querySelector(".rotate-icon");

      section.classList.toggle("open");

      if (body) {
        body.style.display = section.classList.contains("open") ? "block" : "none";
      }

      if (icon) {
        icon.classList.toggle("open");
      }
    });
  });
});
