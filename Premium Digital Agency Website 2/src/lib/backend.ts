const DEFAULT_BACKEND_API_URL = "http://localhost:3001/api/v1";

export function getBackendApiUrl() {
  return (
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    DEFAULT_BACKEND_API_URL
  ).replace(/\/$/, "");
}

export async function fetchBackendJson<T>(
  path: string,
  init?: RequestInit & { next?: { revalidate?: number } },
): Promise<T> {
  const response = await fetch(`${getBackendApiUrl()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers || {}),
    },
    next: init?.next ?? { revalidate: 300 },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Backend request failed (${response.status}) for ${path}: ${message || response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}
