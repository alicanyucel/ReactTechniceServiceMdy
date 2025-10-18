import { API_BASE } from './auth'
import { CreateCustomerPayload, Customer } from '../types/customer'
import { getAuthToken } from './auth'

export async function createCustomer(payload: CreateCustomerPayload): Promise<Customer> {
  const url = `${API_BASE}/api/Customers/CreateCustomer`
  const token = getAuthToken()
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Müşteri oluşturma başarısız (HTTP ${res.status})`)
  }
  return res.json()
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
