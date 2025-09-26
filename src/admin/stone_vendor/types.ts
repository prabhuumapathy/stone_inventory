export type StoneVendor = {
  stone_vendor_id: number
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
