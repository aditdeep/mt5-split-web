// Simple sessionStorage-backed cache: paint the last-known-good data
// immediately on mount (no blank "Memuat..." flash for repeat visits),
// while a fresh fetch happens in the background and silently updates
// the view once it lands. First-ever visit still shows a loading state
// since there's nothing cached yet — that's unavoidable.

const PREFIX = "splitdesk_cache_";

export function getCached<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function setCached<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // sessionStorage full/unavailable — fine to just skip caching.
  }
}
