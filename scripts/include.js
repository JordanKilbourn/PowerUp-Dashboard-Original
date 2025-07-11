// /scripts/include.js
async function loadComponents() {
  const sidebarEl = document.getElementById("sidebar");
  const headerEl = document.getElementById("header");

  const sidebarPromise = fetch("/components/sidebar.html")
    .then(res => {
      if (!res.ok) throw new Error("Sidebar include failed");
      return res.text();
    })
    .then(html => sidebarEl.innerHTML = html)
    .catch(err => console.error(err));

  const headerPromise = fetch("/components/header.html")
    .then(res => {
      if (!res.ok) throw new Error("Header include failed");
      return res.text();
    })
    .then(html => headerEl.innerHTML = html)
    .catch(err => console.error(err));

  return Promise.all([sidebarPromise, headerPromise]);
}
