// /scripts/layout.js

export async function initializePage({ showName = true } = {}) {
  const sidebar = document.getElementById("sidebar");
  const header = document.getElementById("header");

  try {
    const [sidebarHTML, headerHTML] = await Promise.all([
      fetch("/components/sidebar.html").then(res => res.text()),
      fetch("/components/header.html").then(res => res.text()),
    ]);

    sidebar.innerHTML = sidebarHTML;
    header.innerHTML = headerHTML;

    if (showName) {
      const name = sessionStorage.getItem("displayName") || "User";
      const nameEl = document.getElementById("userGreeting");
      if (nameEl) nameEl.textContent = name;
    }

    // 👉 Sidebar toggle logic (binds once DOM is updated)
    const toggleButton = document.getElementById("sidebarToggle");
    if (toggleButton) {
      toggleButton.addEventListener("click", () => {
        document.getElementById("sidebar")?.classList.toggle("open");
        document.getElementById("container")?.classList.toggle("sidebar-open");
        document.getElementById("topOverlayBg")?.classList.toggle("sidebar-open");
        document.getElementById("header")?.classList.toggle("sidebar-open");
      });
    }

  } catch (err) {
    console.error("Component include failed:", err);
  }
}
