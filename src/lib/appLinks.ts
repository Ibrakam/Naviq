const DEFAULT_APP_URL = "http://localhost:3000";

function normalizeBaseUrl(url: string) {
  return url.replace(/\/$/, "");
}

export function getAppBaseUrl() {
  const raw = import.meta.env.VITE_FRONTEND_APP_URL || DEFAULT_APP_URL;
  return normalizeBaseUrl(raw);
}

export function getAppLink(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getAppBaseUrl()}${normalizedPath}`;
}

export function redirectToApp(path: string) {
  window.location.href = getAppLink(path);
}
