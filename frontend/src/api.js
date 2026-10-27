// Centralized API fetch helper with automatic host/proxy fallback
export const BACKEND_URL = 'http://127.0.0.1:8000';

export async function apiFetch(url, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('fixlink_token') : null;
  const mergedHeaders = { ...(options.headers || {}) };
  if (token && !mergedHeaders['Authorization'] && !mergedHeaders['authorization']) {
    mergedHeaders['Authorization'] = `Bearer ${token}`;
  }
  const mergedOptions = { ...options, headers: mergedHeaders };

  // If already absolute URL, execute directly
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return fetch(url, mergedOptions);
  }

  const isFile = typeof window !== 'undefined' && window.location.protocol === 'file:';
  if (isFile) {
    return fetch(`${BACKEND_URL}${url}`, mergedOptions);
  }

  try {
    const res = await fetch(url, mergedOptions);
    // If Vite proxy returned 500 or 502/504, attempt direct backend fallback
    if (!res.ok && (res.status === 500 || res.status === 502 || res.status === 504)) {
      if (typeof window !== 'undefined' && window.location.port !== '8000') {
        try {
          const directRes = await fetch(`${BACKEND_URL}${url}`, mergedOptions);
          return directRes;
        } catch (e) {
          return res;
        }
      }
    }
    return res;
  } catch (err) {
    // If relative fetch failed (e.g. network failure), fallback to direct backend
    if (typeof window !== 'undefined' && window.location.port !== '8000') {
      try {
        return await fetch(`${BACKEND_URL}${url}`, mergedOptions);
      } catch (fallbackErr) {
        throw err;
      }
    }
    throw err;
  }
}
