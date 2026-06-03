const BASE_URL = "http://localhost:3001";

interface ServerError {
  message?: string;
  error?: string;
}

function isServerError(value: unknown): value is ServerError {
  return typeof value === "object" && value !== null;
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  if (!response.ok) {
    let message = `API hiba: ${response.status} ${response.statusText}`;

    try {
      const data: unknown = await response.json();
      if (isServerError(data)) {
        message = data.message ?? data.error ?? message;
      }
    } catch {
      // Ha a szerver nem JSON választ ad, marad az alap hibaüzenet.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
