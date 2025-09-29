import { model } from "@medusajs/framework/utils"

export const StoneVendor = model.define("stone_vendor", {
  stone_vendor_id: model.id().primaryKey(),
  name: model.text(),
  vendor_code: model.text(),
  vendor_number: model.number(),
  city: model.text(),
  state: model.text(),
  country: model.text(),
  carat: model.text(),
  remove_diamond: model.text(),
  color: model.text(),
  clarity: model.text(),
  certificate: model.text(),
  sort_order: model.number(),
  image_status: model.boolean(),
  video_status: model.boolean(),
  status: model.boolean(),
})
