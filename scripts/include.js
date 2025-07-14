// /scripts/include.js

async function loadComponents() {
  const sidebarEl = document.getElementById("sidebar");
  const headerEl = document.getElementById("header");

  try {
    const [sidebarHTML, headerHTML] = await Promise.all([
      fetch("/components/sidebar.html").then(res => {
        if (!res.ok) throw new Error("Sidebar include failed");
        return res.text();
      }),
      fetch("/components/header.html").then(res => {
        if (!res.ok) throw new Error("Header include failed");
        return res.text();
      }),
    ]);

    sidebarEl.innerHTML = sidebarHTML;
    headerEl.innerHTML = headerHTML;

    // Wait for DOM updates to take effect
    await new Promise(resolve => setTimeout(resolve, 0));

    // 🔁 Initialize dependent logic after components are injected
    initAfterIncludes();

  } catch (error) {
    console.error("Component loading error:", error);
  }
}

function initAfterIncludes() {
  // Safely load each script in order:
  const scriptSequence = [
    "/scripts/session.js",
    "/scripts/dashboard-ui.js",
    "/scripts/load-dashboard.js"
  ];

  scriptSequence.forEach(src => {
    const s = document.createElement("script");
    s.src = src;
    s.defer = true;
    document.body.appendChild(s);
  });
}

// Kick off component loading when DOM is ready
document.addEventListener("DOMContentLoaded", loadComponents);
