import { apiRequest, getApiBaseUrl } from "./api";
import {
  clearSession,
  getSession,
  isAuthenticated,
  saveSession,
  signOut,
  type AuthSession,
} from "./session";

export type { AuthSession } from "./session";
export { getSession, isAuthenticated, signOut, getAuthHeaders } from "./session";

export type SignInInput = {
  employeeId: string;
  password: string;
  rememberMe: boolean;
};

export async function signIn(input: SignInInput): Promise<AuthSession> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error("VITE_API_BASE_URL is not configured. Cannot sign in without the backend API.");
  }

  const session = await apiRequest<AuthSession>("/api/auth/sign-in", {
    method: "POST",
    body: JSON.stringify(input),
    skipAuth: true,
    allowUnauthorized: true,
  });

  saveSession(session);
  return session;
}

export { clearSession };
