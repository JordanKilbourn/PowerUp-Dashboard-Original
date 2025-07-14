// /scripts/dashboard-ui.js

function initializeAccordions() {
  const headers = document.querySelectorAll(".accordion-header");
  console.log("Initializing accordions...", headers.length);

  headers.forEach(header => {
    header.addEventListener("click", () => {
      const item = header.closest(".accordion-item");
      const content = item.querySelector(".accordion-content");
      const icon = header.querySelector(".rotate-icon");

      const isOpen = item.classList.contains("open");

      document.querySelectorAll(".accordion-item").forEach(i => {
        i.classList.remove("open");
        const c = i.querySelector(".accordion-content");
        const ic = i.querySelector(".rotate-icon");
        if (c) c.style.maxHeight = null;
        if (ic) ic.classList.remove("open");
      });

      if (!isOpen) {
        item.classList.add("open");
        content.style.maxHeight = content.scrollHeight + "px";
        icon.classList.add("open");
      }
    });
  });
}

// Export to global so include.js can call it
window.initializeAccordions = initializeAccordions;

