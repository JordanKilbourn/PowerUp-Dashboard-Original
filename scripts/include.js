function includeHTML(callback) {
  const elements = document.querySelectorAll('[w3-include-html]');
  let remaining = elements.length;

  if (remaining === 0 && typeof callback === 'function') {
    callback();
    return;
  }

  elements.forEach(el => {
    const file = el.getAttribute("w3-include-html");
    fetch(file)
      .then(response => {
        if (!response.ok) throw new Error(`Failed to load ${file}`);
        return response.text();
      })
      .then(data => {
        el.innerHTML = data;
        el.removeAttribute("w3-include-html");
        remaining--;
        if (remaining === 0 && typeof callback === 'function') {
          callback();
        }
      })
      .catch(err => {
        console.error("Include error:", err);
        el.innerHTML = "<!-- Failed to load include -->";
        remaining--;
        if (remaining === 0 && typeof callback === 'function') {
          callback();
        }
      });
  });
}


