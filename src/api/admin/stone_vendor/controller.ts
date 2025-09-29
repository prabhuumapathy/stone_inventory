import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { Express } from "express"
import { StoneVendorAdminService } from "./stone-vendor-service"

export type PostAdminCreateStoneVendorType = {
  name: string
  vendor_number?: string
  country?: string
  // add other optional fields here
}

export const postCreateStoneVendor = async (
  req: MedusaRequest<PostAdminCreateStoneVendorType>,
  res: MedusaResponse
) => {
  const service = StoneVendorAdminService.fromScope(req.scope)
  await service.create(req.validatedBody)

  res.status(201).json({
    success: true,
    message: "Stone vendor created successfully",
  })
}

export const getStoneVendors = async (req: MedusaRequest, res: MedusaResponse) => {
  const parsedTake = Number.parseInt((req.query.limit as string) ?? "", 10)
  const parsedSkip = Number.parseInt((req.query.offset as string) ?? "", 10)

  const take = Number.isFinite(parsedTake) ? parsedTake : 15
  const skip = Number.isFinite(parsedSkip) ? parsedSkip : 0

  const service = StoneVendorAdminService.fromScope(req.scope)
  const [stone_vendors, count] = await service.list({
    take,
    skip,
    search: (req.query.q as string) || "",
    name: (req.query.name as string) || "",
    vendorCode: (req.query.vendor_code as string) || "",
    status: req.query.status as string | undefined,
    orderBy: req.query.order_by as string | undefined,
    orderDir: req.query.order_dir as string | undefined,
  })

  res.json({
    stone_vendors,
    count,
    limit: take,
    offset: skip,
  })
}

export const getStoneVendor = async (req: MedusaRequest, res: MedusaResponse) => {
  const id = req.params.id
  if (!id) {
    return res.status(400).json({ message: "Invalid id" })
  }

  const service = StoneVendorAdminService.fromScope(req.scope)
  const stone_vendor = await service.getById(id)

  if (!stone_vendor) {
    return res.status(404).json({ message: "Stone vendor not found" })
  }

  res.json({ stone_vendor })
}

export const exportStoneVendors = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const service = StoneVendorAdminService.fromScope(req.scope)
    const { stoneVendors, csv } = await service.export({
      search: (req.query.q as string) || "",
      name: (req.query.name as string) || "",
      vendorCode: (req.query.vendor_code as string) || "",
      status: req.query.status as string | undefined,
      orderBy: req.query.order_by as string | undefined,
      orderDir: req.query.order_dir as string | undefined,
    })

    if (!stoneVendors.length) {
      return res.status(404).json({ message: "No stone vendors found" })
    }

    res.header("Content-Type", "text/csv")
    res.header("Content-Disposition", `attachment; filename="stone_vendors.csv"`)
    res.send(csv)
  } catch (error) {
    console.error("Export Stone Vendors Error:", error)
    res.status(500).json({
      code: "export_error",
      type: "export_error",
      message: "Failed to export stone vendors",
      error: (error as Error).message,
    })
  }
}

export const deleteStoneVendors = async (req: MedusaRequest, res: MedusaResponse) => {
  const { ids } = req.validatedBody as { ids: Array<number | string> }

  const service = StoneVendorAdminService.fromScope(req.scope)

  let result: { normalizedIds: string[]; deletedCount: number }
  try {
    result = await service.softDeleteByIds(ids ?? [])
  } catch (error) {
    console.error("Delete Stone Vendors Error:", error)
    return res.status(500).json({
      message: "Failed to delete stone vendors",
      error: (error as Error).message,
    })
  }

  if (!result.normalizedIds.length) {
    return res.status(400).json({ message: "No valid stone vendor ids provided" })
  }

  if (!result.deletedCount) {
    return res.status(404).json({ message: "Stone vendors not found" })
  }

  res.status(200).json({
    success: true,
    deleted: result.normalizedIds.length,
    ids: result.normalizedIds,
  })
}

export const importStoneVendors = async (req: MedusaRequest, res: MedusaResponse) => {
  const file = (req as MedusaRequest & { file?: Express.Multer.File }).file

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" })
  }

  const content = file.buffer?.toString("utf-8") ?? ""
  if (!content.trim()) {
    return res.status(400).json({ message: "Uploaded file is empty" })
  }

  const replaceFlag = String(((req as any).body?.replace ?? (req as any).query?.replace ?? "")).trim().toLowerCase()
  const replaceExisting = ["true", "1", "yes", "on"].includes(replaceFlag)

  const service = StoneVendorAdminService.fromScope(req.scope)
  const summary = await service.importFromCsvContent(content, replaceExisting)

  if (!summary.processed) {
    return res.status(400).json({ message: "No data rows detected in CSV" })
  }

  const success = summary.errors.length === 0
  const message = replaceExisting
    ? success
      ? "Stone vendors replaced successfully"
      : "Stone vendors imported with some issues. Existing vendors were left untouched."
    : success
    ? "Stone vendors imported successfully"
    : "Stone vendors imported with some issues"

  res.status(success ? 200 : 207).json({
    success,
    message,
    ...summary,
  })
}
