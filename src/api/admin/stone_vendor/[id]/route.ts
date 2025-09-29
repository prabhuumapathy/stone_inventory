import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { StoneVendorAdminService } from "../stone-vendor-service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const id = (req.params as { id?: string }).id
  if (!id) {
    return res.status(400).json({ message: "Invalid id" })
  }

  const service = StoneVendorAdminService.fromScope(req.scope)
  const stone_vendor = await service.getById(id)

  if (!stone_vendor) {
    return res.status(404).json({ message: "Stone vendor not found" })
  }

  return res.json({ stone_vendor })
}

const bodySchema = z
  .object({
    name: z.string().max(255).optional(),
    vendor_code: z.string().max(120).optional(),
    vendor_number: z.number().int().optional(),
    city: z.string().max(255).optional(),
    state: z.string().max(255).optional(),
    country: z.string().max(255).optional(),
    carat: z.string().optional(),
    remove_diamond: z.string().optional(),
    color: z.string().optional(),
    clarity: z.string().optional(),
    certificate: z.string().optional(),
    sort_order: z.number().int().optional(),
    image_status: z.boolean().optional(),
    video_status: z.boolean().optional(),
    status: z.boolean().optional(),
  })
  .strict()

export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  const id = (req.params as { id?: string }).id

  if (!id) {
    return res.status(400).json({ message: "Invalid id" })
  }

  const body = (req as any).validatedBody ?? req.body

  let input: z.infer<typeof bodySchema>
  try {
    input = bodySchema.parse(body)
  } catch (error) {
    return res.status(400).json({
      message: "Invalid payload",
      error: (error as Error).message,
    })
  }

  if (!Object.keys(input).length) {
    return res.status(400).json({ message: "No fields to update" })
  }

  const service = StoneVendorAdminService.fromScope(req.scope)
  const existing = await service.getById(id)

  if (!existing) {
    return res.status(404).json({ message: "Stone vendor not found" })
  }

  const updated = await service.update(id, input)

  if (!updated) {
    return res.status(500).json({ message: "Failed to update stone vendor" })
  }

  return res.status(200).json({
    success: true,
    message: "Stone vendor updated successfully",
    stone_vendor: updated,
  })
}
