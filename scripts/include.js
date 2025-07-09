// /scripts/include.js
function includeHTML(callback) {
  const includes = document.querySelectorAll('[w3-include-html]');
  let remaining = includes.length;

  if (remaining === 0 && typeof callback === "function") callback();

  includes.forEach(async (el) => {
    const file = el.getAttribute("w3-include-html");
    try {
      const res = await fetch(file);
      if (!res.ok) throw new Error(`Missing include: ${file}`);
      el.innerHTML = await res.text();
    } catch (e) {
      console.error(e);
    }

    remaining--;
    if (remaining === 0 && typeof callback === "function") callback();
  });
}


