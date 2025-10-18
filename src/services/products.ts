import { getAuthToken } from './auth'
import type { CreateProductPayload, ProductResponse } from '../types/product'

export async function createProduct(payload: CreateProductPayload): Promise<ProductResponse> {
  const url = 'https://teknikservisapi.mudbey.com.tr:7054/api/Products/CreateProduct'
  const token = getAuthToken()
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
    const err: any = new Error('Ağ hatası: Cihaz oluşturulamadı.')
    err.status = 0
    err.cause = networkErr
    throw err
  }
  const text = await res.text().catch(() => '')
  if (!res.ok) {
    let userMsg = ''
    let details: string[] = []
    try {
      const j = text ? JSON.parse(text) : null
      if (j) {
        if (Array.isArray(j.errorMessages) && j.errorMessages.length > 0) {
          details = j.errorMessages.map((x: any) => String(x))
          userMsg = details[0]
        } else if (typeof j.message === 'string' && j.message.trim()) {
          userMsg = j.message
        }
        if (typeof j.title === 'string' && j.title.trim()) userMsg = userMsg || j.title
        if (typeof j.detail === 'string' && j.detail.trim()) details.push(j.detail)
        if (j.errors && typeof j.errors === 'object') {
          for (const [k, v] of Object.entries(j.errors as Record<string, any>)) {
            if (Array.isArray(v)) details.push(...(v as any[]).map((m) => `${k}: ${String(m)}`))
            else if (v) details.push(`${k}: ${String(v)}`)
          }
        }
      }
    } catch {}
    const err: any = new Error(userMsg || `Cihaz oluşturma başarısız (HTTP ${res.status})`)
    err.status = res.status
    err.rawBody = text
    if (details.length) err.errors = details
    throw err
  }
  try {
    return text ? JSON.parse(text) : {}
  } catch {
    return {}
  }
}
