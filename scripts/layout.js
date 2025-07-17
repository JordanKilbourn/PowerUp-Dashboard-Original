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
  } catch (err) {
    console.error("Component include failed:", err);
  }
}
