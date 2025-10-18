export const API_BASE = (import.meta as any).env?.VITE_API_BASE || '' // empty to use dev proxy; set full URL when deploying
const __env: any = (import.meta as any)?.env || (globalThis as any)?.import?.meta?.env || {}
if (!API_BASE && __env?.PROD) {
  // eslint-disable-next-line no-console
  console.warn('VITE_API_BASE is empty in production. Set it in .env.production to enable API calls.')
}

export type LoginPayload = {
  emailOrUserName: string
  password: string
}

export type RegisterPayload = {
  firstName: string
  lastName: string
  email: string
  password: string
  roles: string[]
  updatedTime: string
  updatedBy: string
  createdBy: string
  cratedTime: string
  createadAt: string
  updatedAt: string
  isDeleted: boolean
}

export type LoginResponse = Record<string, unknown>
export type RegisterResponse = Record<string, unknown>

export const TOKEN_KEY = 'authToken'

function extractTokenFromHeaders(res: Response): string | null {
  const auth = res.headers.get('authorization') || res.headers.get('Authorization')
  if (auth) {
    const parts = auth.split(' ')
    if (parts.length === 2) return parts[1]
    return auth
  }
  return null
}

function deepFindToken(obj: unknown): string | null {
  if (!obj || typeof obj !== 'object') return null
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (typeof v === 'string' && /token/i.test(k) && v.length >= 10) {
      return v
    }
    if (typeof v === 'object' && v) {
      const found = deepFindToken(v)
      if (found) return found
    }
  }
  return null
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const url = `https://teknikservisapi.mudbey.com.tr:7054/api/Auth/Login`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let userMsg = ''
    let errorJson: any = null
    try {
      errorJson = text ? JSON.parse(text) : null
      if (errorJson) {
        if (Array.isArray(errorJson.errorMessages) && errorJson.errorMessages.length > 0) {
          userMsg = String(errorJson.errorMessages[0])
        } else if (typeof errorJson.message === 'string' && errorJson.message.trim()) {
          userMsg = errorJson.message
        }
      }
    } catch {
      // not JSON, ignore
    }

    // Fallback friendly messages by status
    if (!userMsg) {
      if (res.status === 401) userMsg = 'Kullanıcı adı veya şifre hatalı.'
      else if (res.status === 403) userMsg = 'Bu işlem için yetkiniz bulunmuyor.'
      else if (res.status >= 500) userMsg = 'Sunucu kaynaklı bir hata oluştu.'
      else userMsg = 'Giriş işlemi tamamlanamadı.'
    }

    const error: any = new Error(userMsg)
    error.status = res.status
    error.rawBody = text
    if (errorJson) error.errorJson = errorJson
    throw error
  }
  // Try headers first
  let token = extractTokenFromHeaders(res)

  let data: LoginResponse
  const rawText = await res.clone().text().catch(() => '')
  try {
    data = rawText ? JSON.parse(rawText) : {}
  } catch {
    // Not JSON, maybe plain token text
    if (!token && rawText && rawText.length >= 10) token = rawText
    data = {}
  }

  if (!token) {
    token = deepFindToken(data)
  }

  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  }
  return data
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  const url = `https://teknikservisapi.mudbey.com.tr:7054/api/Users/CreateUser`
  
  console.log('Register işlemi başlatılıyor...')
  console.log('URL:', url)
  console.log('Gönderilen veri:', JSON.stringify(payload, null, 2))
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  console.log('Response status:', res.status)
  console.log('Response headers:', res.headers)

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.log('Hata detayı:', text)
    throw new Error(text || `Kayıt başarısız (HTTP ${res.status})`)
  }

  let data: RegisterResponse
  const rawText = await res.clone().text().catch(() => '')
  try {
    data = rawText ? JSON.parse(rawText) : {}
    console.log('API yanıtı:', data)
  } catch {
    data = {}
    console.log('API yanıtı JSON değil:', rawText)
  }

  console.log('Register işlemi tamamlandı!')
  return data
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUserRoles(): string[] {
  const token = getAuthToken()
  if (!token) return []
  try {
    const parts = token.split('.')
    if (parts.length < 2) return []
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    // Common claim keys used across APIs
    const candidates = [
      'roles', 'role', 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
    ]
    for (const key of candidates) {
      const v = payload[key]
      if (!v) continue
      if (Array.isArray(v)) return v.map(String)
      if (typeof v === 'string') {
        // Split comma-separated roles if needed
        return v.split(',').map(s => s.trim()).filter(Boolean)
      }
    }
    return []
  } catch {
    return []
  }
}

export function hasAnyRole(expected: string[]): boolean {
  const roles = getUserRoles().map(r => r.toLowerCase())
  return expected.some(e => roles.includes(e.toLowerCase()))
}
