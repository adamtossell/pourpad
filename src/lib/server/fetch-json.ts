import { cookies, headers } from "next/headers"

export class ServerFetchError extends Error {
  status: number
  payload: unknown

  constructor(message: string, status: number, payload: unknown) {
    super(message)
    this.name = "ServerFetchError"
    this.status = status
    this.payload = payload
  }
}

export type ServerFetchResult<T> = {
  data: T | null
  error: ServerFetchError | null
}

export async function serverFetchJson<T>(path: string, init: RequestInit = {}): Promise<ServerFetchResult<T>> {
  const url = buildInternalUrl(path)
  const headersInit = new Headers(init.headers ?? {})
  const cookieHeader = await buildCookieHeader()

  if (cookieHeader && !headersInit.has("cookie")) {
    headersInit.set("cookie", cookieHeader)
  }

  if (!headersInit.has("accept")) {
    headersInit.set("accept", "application/json")
  }

  const response = await fetch(url, {
    ...init,
    headers: headersInit,
    cache: "no-store",
    next: { revalidate: 0 },
  })

  if (response.ok) {
    const data = (await parseJsonSafe<T>(response)) ?? ({} as T)
    return { data, error: null }
  }

  const payload = await parseJsonSafe<unknown>(response)
  const error = new ServerFetchError(response.statusText || "Request failed", response.status, payload)
  return { data: null, error }
}

async function buildCookieHeader(): Promise<string | null> {
  const cookieStore = await cookies()
  const serialized = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ")

  return serialized.length > 0 ? serialized : null
}

function buildInternalUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const headerBase = getBaseUrlFromHeaders()
  const fallbackBase = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3000"

  return `${headerBase ?? fallbackBase}${normalizedPath}`
}

function getBaseUrlFromHeaders(): string | null {
  try {
    const headersList = headers()
    const getHeaderValue = (name: string): string | null => {
      if (typeof (headersList as { get?: unknown }).get === "function") {
        return (headersList as { get: (key: string) => string | null }).get(name)
      }

      const record = headersList as unknown as Record<string, string | undefined>
      const normalizedName = name.toLowerCase()
      return record?.[normalizedName] ?? record?.[name] ?? null
    }

    const protocol =
      getHeaderValue("x-forwarded-proto") ??
      getHeaderValue("x-forwarded-protocol") ??
      getHeaderValue("proto") ??
      null
    const host = getHeaderValue("x-forwarded-host") ?? getHeaderValue("host")

    if (!host) {
      return null
    }

    return `${protocol ?? "http"}://${host}`
  } catch {
    return null
  }
}

async function parseJsonSafe<T>(response: Response): Promise<T | null> {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}
