import { 
  defineMiddlewares,
  validateAndTransformBody,
  validateAndTransformQuery
} from "@medusajs/framework/http"
import { 
  PostAdminCreateStoneVendor, 
  UpdateStoneVendor, 
  GetStoneVendorsQuery 
} from "./admin/stone_vendor/validators"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import { z } from "zod"
import { 
  postCreateStoneVendor,
  getStoneVendors,
  getStoneVendor,
 
  exportStoneVendors
} from "./admin/stone_vendor/controller"

// Default fields returned by queries
const DEFAULTS = [
  "stone_vendor_id","name","vendor_code","vendor_number","city","state","country",
  "carat","remove_diamond","color","clarity","certificate","sort_order",
  "image_status","video_status","status",
] as const

// Validation schemas
export const GetStoneVendorsSchema = createFindParams().merge(GetStoneVendorsQuery)
const GetStoneVendorSchema = createFindParams().merge(z.object({}))

export default defineMiddlewares({
  routes: [
    // Create stone vendor
    {
      matcher: "/admin/stone_vendor",
      method: "POST",
      middlewares: [
        validateAndTransformBody(PostAdminCreateStoneVendor),
        postCreateStoneVendor
      ],
    },

    // List all stone vendors (with pagination + search)
    {
      matcher: "/admin/stone_vendor",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(GetStoneVendorsSchema, {
          defaults: DEFAULTS as unknown as string[],
          isList: true,
        }),
        getStoneVendors
      ],
    },

    // Get single stone vendor by ID
    {
      matcher: "/admin/stone_vendor/:id",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(GetStoneVendorSchema, {
          defaults: DEFAULTS as unknown as string[],
        }),
        getStoneVendor
      ],
    },

    // Update stone vendor by ID
   

    // Export stone vendors to CSV
    {
      matcher: "/admin/stone_vendor/export",
      method: "GET",
      middlewares: [
        // Optionally validate query params for filtering
        // validateAndTransformQuery(GetStoneVendorsSchema),
        exportStoneVendors
      ],
    },
  ],
})
