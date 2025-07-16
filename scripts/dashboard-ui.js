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

  // Render each row as a simple paragraph block
  container.innerHTML = filtered.map((row, index) => `
    <div class="data-row">
      ${Object.entries(row).map(([k, v]) => `<p><strong>${k}:</strong> ${v}</p>`).join('')}
      <hr />
    </div>
  `).join('');
}
