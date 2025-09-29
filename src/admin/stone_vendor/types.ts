export type StoneVendor = {
  stone_vendor_id: string
  name: string
  vendor_code: string
  vendor_number: number
  city: string
  state: string
  country: string
  carat: number
  remove_diamond: string
  color: string
  clarity: string
  certificate: string
  sort_order: number
  image_status: boolean
  video_status: boolean
  status: boolean
}

export type StoneVendorsResponse = {
  stone_vendors: StoneVendor[]
  count: number
  limit: number
  offset: number
}

export type StoneVendorImportError = {
  row: number
  message: string
}

export type StoneVendorImportResponse = {
  success: boolean
  message: string
  processed: number
  created: number
  updated: number
  deleted: number
  replaced: boolean
  errors: StoneVendorImportError[]
}

export type StoneVendorForm = {
  name: string
  vendor_code: string
  vendor_number: string
  city: string
  state: string
  country: string
  carat: string
  remove_diamond: string
  color: string
  clarity: string
  certificate: string
  sort_order: string
  image_status: boolean
  video_status: boolean
  status: boolean
}
