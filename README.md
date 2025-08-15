# PowerUp Dashboard

A lightweight, client-side web app for logging, reviewing, and tracking shop-floor improvements, safety concerns, and quality catches. The app pulls tabular data from Smartsheet via a tiny JS proxy, renders it into fast, readable tables, and gives operators & leaders a clean, focused workflow.

## Table of contents

- [Overview](#overview)  
- [Features](#features)  
- [How it works](#how-it-works)  
  - [Data flow](#data-flow)  
  - [Session & identity](#session--identity)  
  - [Rendering](#rendering)  
  - [Filtering & sorting](#filtering--sorting)  
  - [Badges / “pills”](#badges--pills)  
  - [Layout & scrolling](#layout--scrolling)  
- [Project structure](#project-structure)  
- [Setup](#setup)  
  - [Smartsheet proxy (`api.js`)](#smartsheet-proxy-apijs)  
  - [Sheet IDs](#sheet-ids)  
  - [Form links](#form-links)  
- [Local development](#local-development)  
- [Deploying](#deploying)  
- [Customization](#customization)  
  - [Column order & labels](#column-order--labels)  
  - [Non-wrapping “short” columns](#nonwrapping-short-columns)  
  - [Clamp / expand long text](#clamp--expand-long-text)  
  - [Adding a new tab](#adding-a-new-tab)  
- [Troubleshooting](#troubleshooting)  
- [Roadmap ideas](#roadmap-ideas)  
- [License](#license)

---

## Overview

The dashboard has three data tabs:

- **Continuous Improvement (CI)**
- **Safety Concerns**
- **Quality Catches**

Each tab shows a scrollable table with sticky headers, smart width behavior, optional text clamping for long cells, and badge (“pill”) styling for statuses. Users can filter by status and launch the appropriate “Add Submission” form.

The UI is 100% static (HTML/CSS/JS). Data is fetched in the browser via a small `api.js` helper that calls your Smartsheet proxy and returns a normalized shape.

---

## Features

- **Fast client-side tables** with sticky headers and sensible column widths
- **Data-driven status filters** (options are built from the rows actually rendered)
- **Sortable columns** (click the header to sort; toggles asc/desc)
- **Badge (“pill”) styling** for important categorical fields (Status, Approval)
- **Add-submission buttons** wired to open your Smartsheet forms
- **Operator scoping**: rows can be filtered by the current `Employee ID`
- **Good defaults**: long text is clamped for readability; short fields never wrap

---

## How it works

### Data flow

```
Smartsheet → (your proxy) → /scripts/api.js → init-dashboard.js → table.js → DOM
```

- `api.js` exposes `fetchSheet(sheetId)` and a `SHEET_IDS` map.
- `init-dashboard.js` decides **which columns** to show per tab and calls `renderTable(...)` for each sheet.
- `table.js` renders normalized sheet data into a `<table>` with headers, rows, and small UX touches.

**Expected data shape** (what `fetchSheet()` should return):

```ts
{
  columns: Array<{ id: string, title: string, hidden?: boolean }>,
  rows: Array<{
    cells: Array<{
      columnId: string,
      value?: any,
      displayValue?: string
    }>
  }>
}
```

### Session & identity

- `session.js` (via `initializeSession()`) is expected to resolve the current user and set `sessionStorage.empID`.
- When `renderTable({ filterByEmpID: true })` is used, rows are **filtered** by the sheet column **“Employee ID”** matching `empID`.

### Rendering

- `init-dashboard.js` defines `COLS` per tab (desired column order).
- `table.js` maps raw sheet column titles to friendly headers (e.g., “Submission Date” → **Date**).
- Dates are formatted to `MM/DD/YY` if the column title includes “date”.
- Each cell is wrapped in a `<div class="cell">` so CSS can clamp/wrap consistently.

### Filtering & sorting

- **Status filter**: each tab’s `<select>` is populated from the **actual values** present in its Status column (no hard-coded lists). Picking a value hides rows whose `data-status` doesn’t match.
- **Sorting**: click any header to sort the **visible** rows by that column. Numeric detection is automatic; clicking again toggles asc/desc.

### Badges / “pills”

- `table.js` detects “Status” and “CI Approval” and wraps values in a `.badge` with a mapped class:
  - `approved`, `completed` → green
  - `pending`, `in progress`, `needs review` → yellow
  - `denied`, `rejected`, `cancelled` → red  
  (All styling in `powerup.css`.)

### Layout & scrolling

- Tables live inside a `.table-scroll` container with `max-height` so the page chrome (header, tabs, etc.) stays put while **only the table body scrolls**.
- **Short fields** (e.g., Date, ID, Tokens, Paid, Work Order) have constrained widths and **don’t wrap**.
- **Long fields** (descriptions, recommendations, etc.) are clamped to a small number of lines by default for scanability; you can opt to expand if you add an “Expand Rows” toggle that flips a class on the table.

---

## Project structure

```
/ (repo root)
├─ PowerUp_Dashboard.html        # Main dashboard page (tabs for CI/Safety/Quality)
├─ /styles
│  └─ powerup.css                # All shared styling and table rules
└─ /scripts
   ├─ api.js                     # fetchSheet() + SHEET_IDS (your Smartsheet proxy wrapper)
   ├─ init-dashboard.js          # loads sheets, renders tables, wires filters/forms/sort
   ├─ table.js                   # renderTable() → builds <table> from normalized sheet data
   └─ session.js                 # initializeSession() → sets sessionStorage.empID
```

> You may also have additional pages (e.g., `level-tracker.html`, `power-hours.html`, `notes.html`, `squads.html`) that reuse the same layout styles.

---

## Setup

### Smartsheet proxy (`api.js`)

`api.js` should export:

```js
export const SHEET_IDS = {
  ciSubmissions:     "YOUR_SMARTSHEET_ID_FOR_CI",
  safetyConcerns:    "YOUR_SMARTSHEET_ID_FOR_SAFETY",
  qualityCatches:    "YOUR_SMARTSHEET_ID_FOR_QUALITY"
};

export async function fetchSheet(sheetId) {
  // Call your backend or Smartsheet proxy and return the normalized shape shown above.
  const res = await fetch(`/api/sheets/${sheetId}`);
  if (!res.ok) throw new Error("Failed to fetch sheet");
  return res.json();
}
```

> If you don’t have a proxy yet, you can stub `fetchSheet` to return static JSON while building the UI.

### Sheet IDs

Update `SHEET_IDS` with the correct Smartsheet sheet IDs. These are referenced from `init-dashboard.js`.

### Form links

In `init-dashboard.js`, configure the form URLs so the **“+ Add Submission”** buttons open the correct Smartsheet forms:

```js
const FORM_URLS = {
  ci:      "https://app.smartsheet.com/b/form/CI_FORM_ID",
  safety:  "https://app.smartsheet.com/b/form/SAFETY_FORM_ID",
  quality: "https://app.smartsheet.com/b/form/QUALITY_FORM_ID",
};
```

---

## Local development

Because this is a static app, you can run it with any static file server:

```bash
# from repo root
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:3000/PowerUp_Dashboard.html` (or the port your server prints).

> Opening the HTML file directly via `file://` may block `fetch()` or relative paths—use a local server.

---

## Deploying

Any static hosting works (GitHub Pages, Netlify, S3 + CloudFront, etc.). Just ensure the `/scripts` and `/styles` paths are preserved and your proxy endpoint(s) are reachable from the deployed origin.

---

## Customization

### Column order & labels

- **Order** is set in `init-dashboard.js` via a `COLS` map per tab.
- **Labels** are mapped in `table.js` (`colHeaderMap`) so you can rename headers without changing your Smartsheet column titles.

### Non-wrapping “short” columns

These are intentionally narrow, single-line fields (e.g., Date/ID/Tokens/Paid/Work Order). CSS in `powerup.css` keeps them tight and `nowrap`. If you add more “short” fields, mirror the existing `th/td[data-col="..."]` width rules.

### Clamp / expand long text

- Long text cells use `.cell` with `-webkit-line-clamp` to show a few lines for scanability.
- If you want an expand/collapse control, add a button that toggles the class `is-expanded` on the table element—CSS already removes the clamp when that class is present.

### Adding a new tab

1. Add a new `<button class="tab-button">` and a `<div class="tab-panel" id="tab-NEW">` in `PowerUp_Dashboard.html` with a `.table-scroll` container and an empty `<table id="NEW-table"></table>`.
2. In `init-dashboard.js`, add a `COLS.new = [ ...columns ]` array and a `loadNew()` that:
   - calls `fetchSheet(SHEET_IDS.newSheet)`
   - calls `renderTable({ sheet, containerId: 'new-table', columnOrder: COLS.new })`
   - wires sorting and filtering like the others.
3. Add a key to `STATUS_KEYS` and `FORM_URLS` if needed.

---

## Troubleshooting

**Table looks unchanged after deploy**  
- Hard refresh: `Ctrl+F5` (Win) / `Cmd+Shift+R` (Mac).
- Open DevTools → Network → check “Disable cache” while DevTools is open.
- Bump file names or add a querystring (e.g., `/styles/powerup.css?v=2025-08-15`) if your host is aggressively caching.

**Status filter doesn’t match any rows**  
- Ensure the tab actually has a **Status** (or “CI Approval”) column.  
- The filter options are derived from rendered rows; if you filter by `Employee ID`, the option list reflects **only your rows**.

**Columns are too wide / wrap unexpectedly**  
- Review the `th/td[data-col="..."]` width rules in `powerup.css` for short fields.  
- For single-word fields that should never wrap (e.g., Facility, Area, Part Number), add them to the `nowrap` selector or give them a small fixed width.

**Badges disappeared**  
- `table.js` converts certain column names to badges. Verify your column headers match the keys (`status`, `ci approval`) after normalization (lower-cased, trimmed).

**No rows appear**  
- If `filterByEmpID` is `true`, make sure `sessionStorage.empID` is set and the sheet actually has an “Employee ID” column with matching values.

---

## Roadmap ideas

- Pagination / “Load More” mode as an alternative to one long scroll
- Per-column search or multi-facet filters
- Inline row expanders for long narratives
- User-level preferences (clamp lines, density, default sort)
- Server-side caching in the Smartsheet proxy

---

## License

Add your preferred license here (e.g., MIT). If this is internal, mark it proprietary.

---

**Questions or updates?**  
Drop the exact file you’re editing and I’ll provide a **surgical** diff so we only change what’s necessary.
