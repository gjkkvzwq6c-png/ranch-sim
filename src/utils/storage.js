const KEY = 'moo_empire_v1';

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...state, lastActive: Date.now() }));
  } catch {
    // storage full or unavailable
  }
}

export function clearState() {
  localStorage.removeItem(KEY);
}
