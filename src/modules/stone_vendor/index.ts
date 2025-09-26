import StoneVendorModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const STONE_VENDOR_MODULE = "stone_vendor"

export default Module(STONE_VENDOR_MODULE, {
  service: StoneVendorModuleService,
})