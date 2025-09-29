import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { z } from "zod"
import type { PostAdminCreateStoneVendorType } from "./controller"
import { postCreateStoneVendor, getStoneVendors, deleteStoneVendors } from "./controller"
import { DeleteStoneVendorsBody } from "./validators"

export const POST = async (
  req: MedusaRequest<PostAdminCreateStoneVendorType>,
  res: MedusaResponse
) => postCreateStoneVendor(req, res)

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => getStoneVendors(req, res)


export const DELETE = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const rawBody = (req as any).validatedBody ?? req.body ?? {}

  const coerceJsonBody = (value: unknown): unknown => {
    if (typeof value !== "string") {
      return value
    }

    let current: unknown = value.trim()
    let lastError: unknown

    for (let attempt = 0; attempt < 5; attempt += 1) {
      if (typeof current !== "string") {
        return current
      }

      const candidate = current.trim()
      if (!candidate) {
        return {}
      }

      try {
        current = JSON.parse(candidate)
        continue
      } catch (error) {
        lastError = error

        if (candidate.startsWith("\"") && candidate.endsWith("\"")) {
          current = candidate.slice(1, -1)
          continue
        }

        break
      }
    }

    throw lastError ?? new SyntaxError("Invalid JSON payload")
  }

  let parsedBody: z.infer<typeof DeleteStoneVendorsBody>
  try {
    const normalized = coerceJsonBody(rawBody)
    parsedBody = DeleteStoneVendorsBody.parse(normalized)
  } catch (error) {
    return res.status(400).json({
      message: "Invalid payload",
      error: (error as Error).message,
    })
  }

  ;(req as any).validatedBody = parsedBody

  return deleteStoneVendors(req, res)
}



