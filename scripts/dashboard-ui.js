document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".collapsible-header").forEach(header => {
    header.addEventListener("click", () => {
      const section = header.closest(".collapsible-section");
      section.classList.toggle("open");
    });
  });
});
