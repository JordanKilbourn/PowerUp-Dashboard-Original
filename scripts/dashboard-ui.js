// /scripts/dashboard-ui.js

function initializeAccordions() {
  const headers = document.querySelectorAll(".accordion-header");

  headers.forEach(header => {
    header.addEventListener("click", () => {
      const item = header.closest(".accordion-item");
      const content = item.querySelector(".accordion-content");
      const icon = header.querySelector(".rotate-icon");

      const isOpen = item.classList.contains("open");

      // Collapse all others
      document.querySelectorAll(".accordion-item").forEach(i => {
        i.classList.remove("open");
        i.querySelector(".accordion-content").style.maxHeight = null;
        i.querySelector(".rotate-icon").classList.remove("open");
      });

      if (!isOpen) {
        item.classList.add("open");
        content.style.maxHeight = content.scrollHeight + "px";
        icon.classList.add("open");
      }
    });
  });
}

// ✅ ACTIVATE after DOM injection
initializeAccordions();
