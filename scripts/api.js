// scripts/api.js

export const SHEET_IDS = Object.freeze({
  powerHours: '1240392906264452',
  levelTracker: '8346763116105604',
  ciSubmissions: '7397205473185668',
  safetyConcerns: '4089265651666820',
  qualityCatches: '1431258165890948'
});

const API_PROXY = 'https://powerup-proxy.onrender.com';

async function handleResponse(res) {
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API Error ${res.status}: ${error}`);
  }
  return res.json();
}

export function fetchSheet(id) {
  return fetch(`${API_PROXY}/sheet/${id}`).then(handleResponse);
}

export function fetchReport(id) {
  return fetch(`${API_PROXY}/report/${id}`).then(handleResponse);
}
