/**
 * NeoBank API Client
 * Base HTTP client for communicating with the Fineract backend.
 * All requests include tenant header and auth token.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://localhost:8443/fineract-provider/api";
const TENANT_ID = import.meta.env.VITE_TENANT_ID ?? "default";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string>;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: unknown,
  ) {
    super(`API ${status}: ${statusText}`);
    this.name = "ApiError";
  }
}

function getAuthToken(): string | null {
  return localStorage.getItem("neobank_token");
}

function setAuthToken(token: string): void {
  localStorage.setItem("neobank_token", token);
}

function clearAuthToken(): void {
  localStorage.removeItem("neobank_token");
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, params, headers: extraHeaders, ...rest } = options;

  let url = `${API_BASE}${path}`;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Fineract-Platform-TenantId": TENANT_ID,
    ...((extraHeaders as Record<string, string>) ?? {}),
  };

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...rest,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(response.status, response.statusText, data);
  }

  // Handle 204 No Content
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, params?: Record<string, string>) =>
    request<T>(path, { method: "GET", params }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body }),
  delete: <T>(path: string) =>
    request<T>(path, { method: "DELETE" }),
};

export { ApiError, getAuthToken, setAuthToken, clearAuthToken };
export default api;
