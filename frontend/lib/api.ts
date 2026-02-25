import { clearStoredTokens, getStoredLocale, getStoredTokens, setStoredTokens } from "@/lib/auth";
import type { ApiErrorPayload, TokenPair } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  status: number;
  payload?: ApiErrorPayload;

  constructor(message: string, status: number, payload?: ApiErrorPayload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

function parsePayload(text: string) {
  if (!text) return null;
  try {
    return JSON.parse(text) as ApiErrorPayload;
  } catch {
    return null;
  }
}

async function refreshTokenPair(refreshToken: string): Promise<TokenPair | null> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Locale": getStoredLocale(),
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as TokenPair;
  setStoredTokens(data);
  return data;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}, retry = true): Promise<T> {
  const { auth = true, headers, body, ...rest } = options;
  const h = new Headers(headers);

  if (body !== undefined && !h.has("Content-Type")) {
    h.set("Content-Type", "application/json");
  }
  if (!h.has("X-Locale")) {
    h.set("X-Locale", getStoredLocale());
  }

  if (auth) {
    const tokens = getStoredTokens();
    if (tokens?.access_token) {
      h.set("Authorization", `Bearer ${tokens.access_token}`);
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: h,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 401 && auth && retry) {
    const tokens = getStoredTokens();
    if (!tokens?.refresh_token) {
      clearStoredTokens();
      throw new ApiError("Unauthorized", 401);
    }

    const refreshed = await refreshTokenPair(tokens.refresh_token);
    if (!refreshed) {
      clearStoredTokens();
      throw new ApiError("Session expired", 401);
    }

    return apiRequest<T>(path, options, false);
  }

  if (!res.ok) {
    const text = await res.text();
    const payload = parsePayload(text);
    throw new ApiError(payload?.detail || `Request failed with status ${res.status}`, res.status, payload ?? undefined);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string, init?: RequestOptions) => apiRequest<T>(path, { ...init, method: "GET" }),
  post: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    apiRequest<T>(path, { ...init, method: "POST", body }),
  put: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    apiRequest<T>(path, { ...init, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    apiRequest<T>(path, { ...init, method: "PATCH", body }),
  delete: <T>(path: string, init?: RequestOptions) => apiRequest<T>(path, { ...init, method: "DELETE" }),
};
