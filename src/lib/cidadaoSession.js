const SESSION_KEY = "lumicity_cidadao";

export function getCidadaoSession() {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setCidadaoSession(cidadao) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(cidadao));
}

export function clearCidadaoSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function isCidadaoLogado() {
  return getCidadaoSession() !== null;
}