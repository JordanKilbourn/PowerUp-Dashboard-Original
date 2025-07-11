function includeComponents(callback) {
  const includeTargets = [
    { id: "sidebar", path: "/components/sidebar.html" },
    { id: "header", path: "/components/header.html" },
    { id: "footer", path: "/components/footer.html" } // optional
  ];

  let remaining = includeTargets.length;

  includeTargets.forEach(({ id, path }) => {
    const el = document.getElementById(id);
    if (!el) return;

    fetch(path)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load: ${path}`);
        return res.text();
      })
      .then(html => {
        el.innerHTML = html;
        if (--remaining === 0 && typeof callback === "function") callback();
      })
      .catch(err => {
        console.error(`Error including ${id}:`, err);
        if (--remaining === 0 && typeof callback === "function") callback();
      });
  });
}
