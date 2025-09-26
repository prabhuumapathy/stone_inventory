import { z } from "zod"

export const PostAdminCreateStoneVendor = z.object({
  name: z.string(),
  vendor_code: z.string(),
  vendor_number: z.number(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  carat: z.number(),
  remove_diamond: z.string(),
  color: z.string(),
  clarity: z.string(),
  certificate: z.string(),
  sort_order: z.number(),
  image_status: z.boolean(),
  video_status: z.boolean(),
  status: z.boolean(),
})

export const UpdateStoneVendor = z.object({
  name: z.string().optional(),
  vendor_code: z.string().optional(),
  vendor_number: z.number().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  carat: z.number().optional(),
  remove_diamond: z.string().optional(),
  color: z.string().optional(),
  clarity: z.string(),
  certificate: z.string().optional(),
  sort_order: z.number().optional(),
  image_status: z.boolean().optional(),
  video_status: z.boolean().optional(),
  status: z.boolean().optional(),
})

const sortableFields = [
  "stone_vendor_id",
  "name",
  "vendor_code",
  "vendor_number",
  "city",
  "state",
  "country",
  "status",
] as const

export const GetStoneVendorsQuery = z.object({
  q: z.string().optional(),
  order_by: z.enum(sortableFields).optional(),
  order_dir: z.enum(["asc", "desc", "ASC", "DESC"]).optional(),
})


