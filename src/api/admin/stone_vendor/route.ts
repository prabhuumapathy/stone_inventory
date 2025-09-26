import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { PostAdminCreateStoneVendorType } from "./controller"
import { postCreateStoneVendor, getStoneVendors } from "./controller"

export const POST = async (
  req: MedusaRequest<PostAdminCreateStoneVendorType>,
  res: MedusaResponse
) => postCreateStoneVendor(req, res)

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => getStoneVendors(req, res)



