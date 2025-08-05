// src/utils/api.js

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(path, options = {}) {
  if (!API_URL) throw new Error('API URL is not configured');
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include', // nếu backend dùng cookie auth
  });
  if (!res.ok) {
    let errMsg = 'Request failed';
    try {
      const err = await res.json();
      errMsg = err.message || JSON.stringify(err);
    } catch {}
    throw new Error(errMsg);
  }
  return res.json();
}
