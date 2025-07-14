// /scripts/dashboard-ui.js

/**
 * Initialize accordion click toggling behavior
 */
function initializeAccordions() {
  const headers = document.querySelectorAll(".accordion-header");

  if (headers.length === 0) return;

  headers.forEach(header => {
    header.addEventListener("click", () => {
      const item = header.closest(".accordion-item");
      const content = item?.querySelector(".accordion-content");
      const icon = header.querySelector(".rotate-icon");

      const isOpen = item.classList.contains("open");

      // Collapse all items
      document.querySelectorAll(".accordion-item").forEach(i => {
        i.classList.remove("open");
        const c = i.querySelector(".accordion-content");
        const ic = i.querySelector(".rotate-icon");
        if (c) c.style.maxHeight = null;
        if (ic) ic.classList.remove("open");
      });

      // Expand clicked item
      if (!isOpen && content) {
        item.classList.add("open");
        content.style.maxHeight = content.scrollHeight + "px";
        if (icon) icon.classList.add("open");
      }
    });
  });
}

export { initializeAccordions };
