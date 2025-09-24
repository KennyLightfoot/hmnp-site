/**
 * Safe `fetch` wrapper that automatically parses JSON when the server
 * returns `Content-Type: application/json`. For any other content-type it
 * falls back to `text()`.
 *
 * Non-OK responses throw an Error that includes the parsed (or raw) body on
 * `error.response` for easier debugging by callers.
 */
export async function fetchJson<T = unknown>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T | string> {
  const res = await fetch(input, init);

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!res.ok) {
    let body: any;
    try {
      body = isJson ? await res.json() : await res.text();
    } catch (_) {
      body = null;
    }
    const error = new Error(`Request failed with status ${res.status}`) as Error & {
      response?: any;
      status?: number;
    };
    error.response = body;
    error.status = res.status;
    throw error;
  }

  return (isJson ? res.json() : res.text()) as unknown as T | string;
}