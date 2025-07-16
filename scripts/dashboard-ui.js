// scripts/dashboard-ui.js

export function renderAccordion(containerId, rows, empID) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const filtered = rows.filter(row => {
    const match = Object.values(row).some(val =>
      typeof val === 'string' && val.toUpperCase().includes(empID.toUpperCase())
    );
    return match;
  });

  if (!filtered.length) {
    container.innerHTML = '<p>No records found.</p>';
    return;
  }

  container.innerHTML = filtered.map((row, index) => `
    <div class="accordion-card">
      <div class="accordion-header" onclick="this.nextElementSibling.classList.toggle('open')">
        <strong>${row['Title'] || row['Topic'] || `Record ${index + 1}`}</strong>
      </div>
      <div class="accordion-body">
        ${Object.entries(row).map(([k, v]) => `<p><strong>${k}:</strong> ${v}</p>`).join('')}
      </div>
    </div>
  `).join('');
}
