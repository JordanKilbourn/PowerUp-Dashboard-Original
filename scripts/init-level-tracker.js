import { initializePage } from './layout.js';
import { renderTable } from './table.js';
import { fetchSheet, SHEET_IDS } from './apis.js';
import './session.js';

document.addEventListener("DOMContentLoaded", async () => {
  await initializePage();

  try {
    const sheet = await fetchSheet(SHEET_IDS.levelTracker);

    renderTable({
      sheet,
      containerId: "levelTableContainer",
      title: "Monthly Level Tracker",
      excludeCols: [],
      checkmarkCols: ["Tuesday Tutorial Attended?", "On Team?", "Leads Team?", "Meets L1", "Meets L2", "Meets L3"],
      filterByEmpID: true
    });

  } catch (err) {
    console.error("Failed to load Level Tracker data:", err);
  }
});
