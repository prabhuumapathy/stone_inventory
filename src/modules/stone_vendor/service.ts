import { MedusaService } from "@medusajs/framework/utils"
import { StoneVendor } from "./models/stone_vendor"

class StoneVendorModuleService extends MedusaService({
  StoneVendor,
}) {

}

export default StoneVendorModuleService