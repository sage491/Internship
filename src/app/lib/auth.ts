const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const USE_REMOTE = Boolean(API_BASE);
const SESSION_KEY = "ims_auth_session";

export type AuthSession = {
  employeeId: string;
  name: string;
  role: string;
  department: string;
  token: string;
  rememberMe: boolean;
};

export type SignInInput = {
  employeeId: string;
  password: string;
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

export async function signIn(input: SignInInput): Promise<AuthSession> {
  if (USE_REMOTE) {
    const response = await fetch(`${API_BASE}/api/auth/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as { message?: string };
      throw new Error(error.message ?? "Unable to sign in right now.");
    }

    const session = (await response.json()) as AuthSession;
    saveSession(session);
    return session;
  }

  await delay();

  const employeeId = input.employeeId.trim().toUpperCase();
  const password = input.password.trim();

  if (!employeeId || !password) {
    throw new Error("Please enter your Employee ID and Password to continue.");
  }

  if (employeeId !== "EMP-1001" || password !== "admin123") {
    throw new Error("Invalid employee ID or password.");
  }

  const session: AuthSession = {
    employeeId,
    name: "Administrator",
    role: "Administrator",
    department: "IT & Systems",
    token: `session-${employeeId.toLowerCase()}`,
    rememberMe: input.rememberMe,
  };

  saveSession(session);
  return session;
}
