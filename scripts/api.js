const SHEET_IDS = Object.freeze({
  powerHours: '1240392906264452',
  levelTracker: '8346763116105604',
  ciSubmissions: '7397205473185668',
  safetyConcerns: '4089265651666820',
  qualityCatches: '1431258165890948'
});

const API_PROXY = 'https://powerup-proxy.onrender.com';
const cache = new Map();

async function fetchSheet(sheetId) {
  if (cache.has(sheetId)) return cache.get(sheetId);
  const res = await fetch(`${API_PROXY}/sheet/${sheetId}`).then(handleResponse);
  cache.set(sheetId, res);
  setTimeout(() => cache.delete(sheetId), 300000); // 5-minute cache
  return res;
}

async function fetchReport(reportId) {
  if (cache.has(reportId)) return cache.get(reportId);
  const res = await fetch(`${API_PROXY}/report/${reportId}`).then(handleResponse);
  cache.set(reportId, res);
  setTimeout(() => cache.delete(reportId), 300000); // 5-minute cache
  return res;
}

async function handleResponse(res) {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText}`);
  }
  return res.json();
}

export { SHEET_IDS, fetchSheet, fetchReport };
