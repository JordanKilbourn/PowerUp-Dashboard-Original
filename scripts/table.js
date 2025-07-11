const wrapper = document.createElement("div");
wrapper.className = "accordion-table-wrapper";

const table = document.createElement("table");
const thead = table.createTHead();
const tbody = table.createTBody();

// Build header
const headerRow = thead.insertRow();
visibleHeaders.forEach(title => {
  const th = document.createElement("th");
  th.textContent = title;
  headerRow.appendChild(th);
});

// Populate rows
rows.forEach(row => {
  const tr = tbody.insertRow();
  visibleHeaders.forEach(col => {
    const td = tr.insertCell();
    const val = getVal(row, colMap, col);
    td.textContent = val;
    td.title = val;

    if (col.toLowerCase().includes("problem") || col.toLowerCase().includes("solution")) {
      td.classList.add("wrap");
    }

    if (["resourced", "paid", "project work completed"].includes(col.toLowerCase())) {
      td.style.textAlign = "center";
      if (val.toLowerCase() === "true" || val === "✔") {
        td.innerHTML = `<i class="fas fa-check" style="color:#22c55e;"></i>`;
      }
    }
  });
});

wrapper.appendChild(table);
section.appendChild(wrapper);

