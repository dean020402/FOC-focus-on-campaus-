const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api'

function buildUrl(path: string): string {
  const base = apiBaseUrl.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(buildUrl(path))

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return (await response.json()) as T
}
