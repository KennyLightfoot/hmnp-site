import { cookies, headers } from "next/headers";

function buildInternalBaseUrl(): string {
  const envBase =
    process.env.INTERNAL_ADMIN_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.VERCEL_URL;

  if (envBase) {
    if (envBase.startsWith("http")) {
      return envBase.replace(/\/$/, "");
    }
    // Handle VERCEL_URL which does not include protocol
    return `https://${envBase.replace(/\/$/, "")}`;
  }

  const headerList = headers();
  const host = headerList.get("host") || "localhost:3000";
  const protocolHeader = headerList.get("x-forwarded-proto");
  const protocol =
    protocolHeader ||
    (host.includes("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");

  return `${protocol}://${host}`;
}

function buildInternalUrl(path: string): string {
  const base = buildInternalBaseUrl();
  if (path.startsWith("http")) {
    return path;
  }
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function fetchAdminJson<T>(path: string, init?: RequestInit): Promise<T> {
  const cookieStore = cookies();
  const response = await fetch(buildInternalUrl(path), {
    cache: "no-store",
    ...init,
    headers: {
      ...(init?.headers || {}),
      Cookie: cookieStore.toString(),
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Admin API request failed (${response.status}): ${body}`);
  }

  return (await response.json()) as T;
}

