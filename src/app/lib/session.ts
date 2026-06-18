const SESSION_KEY = "ims_auth_session";

export type AuthSession = {
  employeeId: string;
  name: string;
  role: string;
  department: string;
  token: string;
  rememberMe: boolean;
};

function readSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function getSession(): AuthSession | null {
  return readSession();
}

export function isAuthenticated(): boolean {
  return Boolean(readSession()?.token);
}

export function saveSession(session: AuthSession): void {
  clearSession();
  const storage = session.rememberMe ? localStorage : sessionStorage;
  storage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

export function signOut(): void {
  clearSession();
}

export function getAuthHeaders(): Record<string, string> {
  const token = readSession()?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
