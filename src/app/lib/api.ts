import { getAuthHeaders } from "./session";

const DEPLOYED_API_BASE_URL = "https://internship-vn6z.onrender.com";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getApiBaseUrl(): string {
  const configured = (import.meta.env.VITE_API_BASE_URL ?? "").trim();
  return (configured || DEPLOYED_API_BASE_URL).replace(/\/$/, "");
}

export function isApiConfigured(): boolean {
  return Boolean(getApiBaseUrl());
}

export type ApiRequestOptions = RequestInit & {
  /** Skip attaching Authorization header (e.g. sign-in). */
  skipAuth?: boolean;
  /** Do not map 401 to "Session expired" (e.g. failed login). */
  allowUnauthorized?: boolean;
};

export async function apiRequest<T>(path: string, init?: ApiRequestOptions): Promise<T> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new ApiError(
      "VITE_API_BASE_URL is not configured. Set it in Vercel environment variables and rebuild.",
      0,
    );
  }

  const { skipAuth, allowUnauthorized, ...requestInit } = init ?? {};
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(skipAuth ? {} : getAuthHeaders()),
    ...(requestInit.headers as Record<string, string> | undefined),
  };

  const response = await fetch(`${baseUrl}${path}`, {
    ...requestInit,
    headers,
  });

  if (response.status === 401 && !allowUnauthorized) {
    throw new ApiError("Session expired. Please sign in again.", 401);
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { message?: string };
    throw new ApiError(body.message ?? `Request failed: ${response.status}`, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
