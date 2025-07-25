// /scripts/api.js

const SHEET_IDS = Object.freeze({
  powerHours: '1240392906264452',
  levelTracker: '8346763116105604',
  ciSubmissions: '6797575881445252',
  safetyConcerns: '3310696565526404',
  qualityCatches: '8096237664292740'
});

const API_PROXY = 'https://powerup-proxy.onrender.com';

/**
 * Fetch a full Smartsheet sheet by ID
 * @param {string} sheetId - Smartsheet Sheet ID
 * @returns {Promise<Object>}
 */
function fetchSheet(sheetId) {
  return fetch(`${API_PROXY}/sheet/${sheetId}`).then(handleResponse);
}

/**
 * Fetch a Smartsheet report by ID
 * @param {string} reportId - Smartsheet Report ID
 * @returns {Promise<Object>}
 */
function fetchReport(reportId) {
  return fetch(`${API_PROXY}/report/${reportId}`).then(handleResponse);
}

/**
 * Gracefully handle fetch responses
 * @param {Response} res
 * @returns {Promise<Object>}
 */
async function handleResponse(res) {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText}`);
  }
  return res.json();
}

export { SHEET_IDS, fetchSheet, fetchReport };
