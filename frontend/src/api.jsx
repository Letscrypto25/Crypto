const BASE = 'http://localhost:3000';

export const postPayment = (gmail, amount) =>
  fetch(`${BASE}/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gmail, amount })
  }).then(res => res.json());

export const getBalance = (gmail) =>
  fetch(`${BASE}/balance/${gmail}`).then(res => res.json());

export const postStrategy = (gmail, strategy) =>
  fetch(`${BASE}/strategy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gmail, strategy })
  }).then(res => res.json());

export const getDrawResult = () =>
  fetch(`${BASE}/draw`).then(res => res.json());
