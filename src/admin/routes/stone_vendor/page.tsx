// src/admin/stone-vendors/page.tsx

import StoneVendorPage from "../../stone_vendor/StoneVendorPage"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { TagSolid } from "@medusajs/icons"

export const config = defineRouteConfig({
  label: "Stone Vendors",
  icon: TagSolid,
})

export default StoneVendorPage
