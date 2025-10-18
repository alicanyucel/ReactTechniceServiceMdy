export type CreateProductPayload = {
  brand: string
  model: string
  serialNumber: string
  description: string
  customerId: string
  productType: number
  updatedTime: string
  updatedBy: string
  createdBy: string
  cratedTime: string
  createadAt: string
  updatedAt: string
  isDeleted: boolean
}

export type ProductResponse = Record<string, unknown>
