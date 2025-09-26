import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Parser } from "json2csv"
import { createStoneVendorWorkflow } from "../../../workflows/stone_vendor"
import { STONE_VENDOR_MODULE } from "../../../modules/stone_vendor"
import StoneVendorModuleService from "../../../modules/stone_vendor/service"

const escapeIlikePattern = (value: string) => value.replace(/[\\%_]/g, (match) => `\\${match}`)

const SORTABLE_FIELDS = [
  "stone_vendor_id",
  "name",
  "vendor_code",
  "vendor_number",
  "city",
  "state",
  "country",
  "status",
]

const DEFAULT_ORDER_BY = "stone_vendor_id"
const DEFAULT_ORDER_DIR = "DESC"

const resolveSort = (orderBy?: string, orderDir?: string) => {
  const normalizedField = orderBy?.toLowerCase()
  const matchedField = SORTABLE_FIELDS.find((field) => field === normalizedField) || DEFAULT_ORDER_BY

  const normalizedDir = orderDir?.toLowerCase()
  const matchedDir = normalizedDir === "asc" ? "ASC" : normalizedDir === "desc" ? "DESC" : DEFAULT_ORDER_DIR

  return { field: matchedField, direction: matchedDir as "ASC" | "DESC" }
}

const buildStoneVendorFilters = (search: string) => {
  const trimmed = search.trim()
  if (!trimmed) {
    return {}
  }

  const searchPattern = `%${escapeIlikePattern(trimmed)}%`
  const orFilters: Record<string, any>[] = [
    { name: { $ilike: searchPattern } },
    { vendor_code: { $ilike: searchPattern } },
    { city: { $ilike: searchPattern } },
    { state: { $ilike: searchPattern } },
    { country: { $ilike: searchPattern } },
  ]

  const numericSearch = Number(trimmed)
  if (!Number.isNaN(numericSearch)) {
    orFilters.push({ vendor_number: numericSearch })
  }

  return { $or: orFilters }
}

export type PostAdminCreateStoneVendorType = {
  name: string
  vendor_number?: string
  country?: string
  // add other optional fields here
}

/**
 * Create a stone vendor
 */
export const postCreateStoneVendor = async (
  req: MedusaRequest<PostAdminCreateStoneVendorType>,
  res: MedusaResponse
) => {
  await createStoneVendorWorkflow(req.scope).run({ input: req.validatedBody })

  res.status(201).json({
    success: true,
    message: "Stone vendor created successfully",
  })
}

/**
 * Get all stone vendors (with pagination + search)
 */
export const getStoneVendors = async (req: MedusaRequest, res: MedusaResponse) => {
  const take = parseInt((req.query.limit as string) || "15", 10)
  const skip = parseInt((req.query.offset as string) || "0", 10)
  const rawSearch = (req.query.q as string) || ""
  const orderBy = req.query.order_by as string | undefined
  const orderDir = req.query.order_dir as string | undefined
  const stoneVendorModuleService: StoneVendorModuleService = req.scope.resolve(
    STONE_VENDOR_MODULE
  )

  const filters = buildStoneVendorFilters(rawSearch)
  const { field, direction } = resolveSort(orderBy, orderDir)

  const [stone_vendors, count] =
    await stoneVendorModuleService.listAndCountStoneVendors(filters, {
      skip,
      take,
      order: { [field]: direction },
    })

  res.json({
    stone_vendors,
    count,
    limit: take,
    offset: skip,
  })
}

/**
 * Get a single stone vendor
 */
export const getStoneVendor = async (req: MedusaRequest, res: MedusaResponse) => {
  const id = req.params.id
  if (!id) {
    return res.status(400).json({ message: "Invalid id" })
  }

  const query = req.scope.resolve("query")

  const { data } = await query.graph({
    entity: "stone_vendor",
    fields: ["*"],
    filters: { stone_vendor_id: id },
    pagination: { take: 1 },
  })

  const stone_vendor = Array.isArray(data) ? data[0] : undefined
  if (!stone_vendor) {
    return res.status(404).json({ message: "Stone vendor not found" })
  }

  res.json({ stone_vendor })
}

/**
 * Export stone vendors to CSV
 */
export const exportStoneVendors = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const stoneVendorModuleService: StoneVendorModuleService = req.scope.resolve(
      STONE_VENDOR_MODULE
    )

    const rawSearch = (req.query.q as string) || ""
    const orderBy = req.query.order_by as string | undefined
    const orderDir = req.query.order_dir as string | undefined
    const filters = buildStoneVendorFilters(rawSearch)
    const { field, direction } = resolveSort(orderBy, orderDir)

    const stone_vendors = await stoneVendorModuleService.listStoneVendors(filters, {
      order: { [field]: direction },
    })

    if (!stone_vendors || stone_vendors.length === 0) {
      return res.status(404).json({ message: "No stone vendors found" })
    }

    const fields = Object.keys(stone_vendors[0])
    const parser = new Parser({ fields })
    const csv = parser.parse(stone_vendors)

    res.header("Content-Type", "text/csv")
    res.header("Content-Disposition", `attachment; filename="stone_vendors.csv"`)
    res.send(csv)
  } catch (err) {
    console.error("Export Stone Vendors Error:", err)
    res.status(500).json({
      code: "export_error",
      type: "export_error",
      message: "Failed to export stone vendors",
      error: (err as Error).message,
    })
  }
}
