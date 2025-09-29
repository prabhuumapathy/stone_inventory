import {
  defineMiddlewares,
  validateAndTransformBody,
  validateAndTransformQuery
} from "@medusajs/framework/http"
import multer from "multer"
import {
  PostAdminCreateStoneVendor,
  UpdateStoneVendor,
  GetStoneVendorsQuery,
  DeleteStoneVendorsBody
} from "./admin/stone_vendor/validators"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import { z } from "zod"
import {
  postCreateStoneVendor,
  getStoneVendors,
  getStoneVendor,
  exportStoneVendors,
  importStoneVendors,
  deleteStoneVendors,
} from "./admin/stone_vendor/controller"

// Default fields returned by queries
const DEFAULTS = [
  "stone_vendor_id","name","vendor_code","vendor_number","city","state","country",
  "carat","remove_diamond","color","clarity","certificate","sort_order",
  "image_status","video_status","status",
] as const

const upload = multer({ storage: multer.memoryStorage() })

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

    // Delete stone vendors
    {
      matcher: "/admin/stone_vendor",
      method: "DELETE",
      middlewares: [
        validateAndTransformBody(DeleteStoneVendorsBody),
        deleteStoneVendors,
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

    // Import stone vendors from CSV
    {
      matcher: "/admin/stone_vendor/import",
      method: "POST",
      middlewares: [
        upload.single("file"),
        importStoneVendors,
      ],
    },

    // Export stone vendors to CSV
    {
      matcher: "/admin/stone_vendor/export",
      method: "GET",
      middlewares: [
        exportStoneVendors
      ],
    },
  ],
})



