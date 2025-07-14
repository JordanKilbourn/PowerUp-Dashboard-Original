// /scripts/api.js

const SHEET_IDS = {
  powerHours: '1240392906264452',
  levelTracker: '8346763116105604',
  ciSubmissions: '7397205473185668',
  safetyConcerns: '4089265651666820',
  qualityCatches: '1431258165890948'
};

const API_PROXY = 'https://powerup-proxy.onrender.com';

function fetchSheet(id) {
  return fetch(`${API_PROXY}/sheet/${id}`).then(res => res.json());
}

function fetchReport(id) {
  return fetch(`${API_PROXY}/report/${id}`).then(res => res.json());
}

export { SHEET_IDS, fetchSheet, fetchReport };

