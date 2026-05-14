const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8081/api"

export interface ApiError extends Error {
  status: number
}

function makeApiError(status: number, message: string): ApiError {
  const err = new Error(message) as ApiError
  err.name   = "ApiError"
  err.status = status
  return err
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    let msg = res.statusText
    try {
      const body = await res.json()
      if (body?.error) msg = body.error
    } catch { /* ignore */ }
    throw makeApiError(res.status, msg)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  get:    <T>(path: string)                   => request<T>(path),
  post:   <T>(path: string, body: unknown)    => request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown)    => request<T>(path, { method: "PUT",  body: JSON.stringify(body) }),
  delete: <T = void>(path: string)            => request<T>(path, { method: "DELETE" }),
}
