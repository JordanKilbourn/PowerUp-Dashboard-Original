import { initializePage } from './layout.js';
import { renderTable } from './table.js';
import './session.js';

document.addEventListener("DOMContentLoaded", async () => {
  await initializePage();

  document.getElementById("userGreeting").textContent = sessionStorage.getItem("displayName") || "User";
  document.getElementById("currentMonth").textContent = sessionStorage.getItem("currentMonth") || "";
  document.getElementById("userLevel").textContent = sessionStorage.getItem("currentLevel") || "";

  try {
    const res = await fetch("https://powerup-proxy.onrender.com/sheet/8346763116105604");
    const sheet = await res.json();

    renderTable({
      sheet,
      containerId: "levelTrackerTableContainer",
      title: "Monthly Level Tracker",
      excludeCols: [],
      checkmarkCols: ["Tuesday Tutorial Attended?", "On Team?", "Leads Team?", "Meets L1", "Meets L2", "Meets L3"],
      filterByEmpID: true
    });

  } catch (err) {
    console.error("Failed to load Level Tracker data:", err);
  }
});
