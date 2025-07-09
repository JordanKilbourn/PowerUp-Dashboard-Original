// /scripts/include.js
document.addEventListener("DOMContentLoaded", () => {
  const includes = document.querySelectorAll('[id]');
  includes.forEach(async (el) => {
    const file = `/components/${el.id}.html`;
    try {
      const res = await fetch(file);
      if (!res.ok) throw new Error(`Missing include: ${file}`);
      el.innerHTML = await res.text();
    } catch (e) {
      console.error(e);
    }
  });
});

