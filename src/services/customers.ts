import { API_BASE } from './auth'
import { CreateCustomerPayload, Customer } from '../types/customer'
import { getAuthToken } from './auth'

export async function createCustomer(payload: CreateCustomerPayload): Promise<Customer> {
  // Prefer configured base; fallback to dev proxy '/api'
  const url = API_BASE ? `${API_BASE}/api/Customers/CreateCustomer` : '/api/Customers/CreateCustomer'
  const token = getAuthToken()
  // eslint-disable-next-line no-console
  console.debug('[createCustomer] POST', url, payload)
  let res: Response
  try {
    res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
    })
  } catch (networkErr: any) {
    const err: any = new Error('Ağ bağlantı hatası. İnternet bağlantınızı ve sunucu durumunu kontrol edin.')
    err.status = 0
    err.cause = networkErr
    throw err
  }
  const text = await res.text().catch(() => '')
  if (!res.ok) {
    // Try parse error envelope/ProblemDetails/ModelState
    let userMsg = ''
    let details: string[] = []
    let code: string | undefined
    try {
      const j = text ? JSON.parse(text) : null
      if (j) {
        // Custom envelope
        if (Array.isArray(j.errorMessages) && j.errorMessages.length > 0) {
          details = j.errorMessages.map((x: any) => String(x))
          userMsg = details[0]
        } else if (typeof j.message === 'string' && j.message.trim()) {
          userMsg = j.message
        }
        // ASP.NET Core ProblemDetails
        if (typeof j.title === 'string' && j.title.trim()) {
          userMsg = userMsg || j.title
        }
        if (typeof j.detail === 'string' && j.detail.trim()) {
          details.push(j.detail)
        }
        if (j.errors && typeof j.errors === 'object') {
          for (const [k, v] of Object.entries(j.errors as Record<string, any>)) {
            if (Array.isArray(v)) {
              for (const msg of v) details.push(`${k}: ${String(msg)}`)
            } else if (v) {
              details.push(`${k}: ${String(v)}`)
            }
          }
        }
        if (typeof j.code === 'string') code = j.code
      }
    } catch {}
    // Parse rate-limit headers for 429
    let retryAfterSec: number | undefined
    const ra = res.headers.get('Retry-After')
    if (ra) {
      const n = parseInt(ra, 10)
      if (!Number.isNaN(n)) retryAfterSec = n
      else {
        const d = new Date(ra)
        if (!isNaN(d.getTime())) {
          retryAfterSec = Math.max(0, Math.ceil((d.getTime() - Date.now()) / 1000))
        }
      }
    }
    if (!retryAfterSec) {
      const alt = res.headers.get('x-ratelimit-reset') || res.headers.get('x-rate-limit-reset')
      if (alt) {
        const ts = parseInt(alt, 10)
        if (!Number.isNaN(ts)) retryAfterSec = Math.max(0, Math.ceil(ts - Date.now() / 1000))
      }
    }
    if (!userMsg) {
      if (res.status === 400) userMsg = 'Geçersiz istek (400). Lütfen form alanlarını kontrol edin.'
      else if (res.status === 429) userMsg = 'Çok fazla istek (429). Lütfen biraz sonra tekrar deneyin.'
      else userMsg = `Müşteri oluşturma başarısız (HTTP ${res.status})`
    }
    const err: any = new Error(userMsg)
    err.status = res.status
    err.rawBody = text
    if (details.length) err.errors = details
    if (code) err.code = code
    if (retryAfterSec != null) err.retryAfterSec = retryAfterSec
    // eslint-disable-next-line no-console
    console.error('[createCustomer] HTTP Error', res.status, text)
    throw err
  }
  // Parse success response (may be plain object or envelope)
  try {
    const j = text ? JSON.parse(text) : {}
    if (j && typeof j === 'object') {
      if ('isSuccessful' in j) {
        if (j.isSuccessful === false) {
          const msgs = Array.isArray(j.errorMessages) ? j.errorMessages.join(', ') : (j.errorMessages || 'Bilinmeyen hata')
          throw new Error(`Müşteri oluşturulamadı: ${msgs}`)
        }
        if ('data' in j && j.data) return j.data as Customer
      }
    }
    return j as Customer
  } catch {
    // If not JSON, return minimal object
    return {} as Customer
  }
}

// Placeholder: API list endpoint belirtilmediği için örnek bir fetch simülasyonu yapılabilir.
export async function fetchCustomers(): Promise<Customer[]> {
  const url = 'https://teknikservisapi.mudbey.com.tr:7054/api/Customers/GetAll'
  const token = getAuthToken()
  // eslint-disable-next-line no-console
  console.debug('[fetchCustomers] POST', url || '/api/Customers/GetAll', 'token?', !!token)
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({}),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    // eslint-disable-next-line no-console
    console.error('[fetchCustomers] HTTP Error', res.status, text)
    throw new Error(text || `Müşteri listesi alınamadı (HTTP ${res.status})`)
  }
  const rawText = await res.text().catch(() => '')
  let json: any = null
  try { json = rawText ? JSON.parse(rawText) : null } catch { json = rawText }
  // eslint-disable-next-line no-console
  console.debug('[fetchCustomers] Response sample', typeof json === 'string' ? json.slice(0, 200) : { keys: json && Object.keys(json), preview: json && (Array.isArray(json) ? json.slice(0,1) : (json.data || json.items || json.result || json.value || json.records || json.list || null)) })

  // If API uses a success envelope
  if (json && typeof json === 'object' && 'isSuccessful' in json && json.isSuccessful === false) {
    const msgs = Array.isArray(json.errorMessages) ? json.errorMessages.join(', ') : (json.errorMessages || 'Bilinmeyen hata')
    throw new Error(`Müşteri listesi alınamadı: ${msgs}`)
  }

  // Handle the exact provided shape first
  if (json && typeof json === 'object' && json.isSuccessful === true && Array.isArray(json.data)) {
    return json.data as Customer[]
  }

  const pickArray = (obj: any): Customer[] => {
    if (!obj) return []
    if (Array.isArray(obj)) return obj
    if (Array.isArray(obj.data)) return obj.data
    if (Array.isArray(obj.items)) return obj.items
    if (Array.isArray(obj.result)) return obj.result
    if (Array.isArray(obj.value)) return obj.value
    if (Array.isArray(obj.records)) return obj.records
    if (Array.isArray(obj.list)) return obj.list
    if (obj.data) {
      const d = obj.data
      if (Array.isArray(d.items)) return d.items
      if (Array.isArray(d.result)) return d.result
      if (Array.isArray(d.value)) return d.value
      if (Array.isArray(d.records)) return d.records
      if (Array.isArray(d.list)) return d.list
    }
    // Fallback: find the first array of objects anywhere
    if (typeof obj === 'object') {
      for (const v of Object.values(obj)) {
        if (Array.isArray(v) && v.every((x) => x && typeof x === 'object')) return v
        if (v && typeof v === 'object') {
          const inner = pickArray(v)
          if (inner.length) return inner
        }
      }
    }
    return []
  }

  return pickArray(json) as Customer[]
}

export async function deleteCustomer(id: string): Promise<void> {
  const url = 'https://teknikservisapi.mudbey.com.tr:7054/api/Customers/CustomerDelete'
  const token = getAuthToken()
  // eslint-disable-next-line no-console
  console.debug('[deleteCustomer] POST', url, 'id?', !!id)
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ id }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    // eslint-disable-next-line no-console
    console.error('[deleteCustomer] HTTP Error', res.status, text)
    throw new Error(text || `Müşteri silme başarısız (HTTP ${res.status})`)
  }
}
