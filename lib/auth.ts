const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const TOKEN_KEY = "splitdesk_token";
const USER_KEY = "splitdesk_user";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "master" | "follower";
  master_id?: number;
  follower_id?: number;
};

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL belum di-set.");

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Login gagal. Cek email/password.");
  }

  const data: { token: string; user: AuthUser } = await res.json();
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/** Fetch wrapper that attaches the Bearer token automatically. */
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: token ? `Bearer ${token}` : "",
      Accept: "application/json",
    },
    cache: "no-store",
  });
}

/** Where to send someone right after login, based on their role. */
export function homeRouteForRole(user: AuthUser): string {
  if (user.role === "admin") return "/";
  if (user.role === "master") return `/masters/${user.master_id}`;
  return "/portal";
}
