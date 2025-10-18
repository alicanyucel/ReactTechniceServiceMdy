export type Address = {
  addressLine?: string
  city?: string
  neighborhood?: string
  district?: string
  zipCode?: string
  country?: string
}

export type Customer = {
  id?: string | number
  name: string
  surname: string
  phoneNumber?: string
  email?: string
  address?: Address
  customerType?: number | { name?: string; value?: number }
  createdAt?: string
  updatedAt?: string
}

export type CreateCustomerPayload = {
  name: string
  surname: string
  phoneNumber?: string
  email?: string
  address?: Address
  customerType?: number
  // Optional metadata fields will be omitted if undefined
  updatedTime?: string
  updatedBy?: string
  createdBy?: string
  cratedTime?: string
  createadAt?: string
  updatedAt?: string
  isDeleted?: boolean
}
